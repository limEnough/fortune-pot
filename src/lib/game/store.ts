import { createHash } from "node:crypto";
import { kv } from "@/lib/kv";
import { isElementKey, type ElementKey } from "./elements";
import { DEFAULT_ITEM, itemById, normalizeDecor, SLOT_KEYS, type Decor } from "./items";
import { msUntilNextReward, rollDailyReward, seoulDateKey } from "./reward";
import type { GuestEntry, RewardResult, RoomView } from "./types";

/*
 * 내 방 서버 저장소.
 *
 * 키는 셋으로 나눠 둔다.
 *   game:room:{id}          방 문서(원소·꾸미기·포인트·주인 열쇠)
 *   game:room:{id}:g        방명록 해시 (필드 = 글 id)
 *   game:reward:{id}:{날짜}  오늘 지급 표식 — NX 로만 세운다
 *
 * 방명록을 해시 필드 쓰기로 처리하면 문서 전체를 읽어 고쳐 쓸 일이 없다.
 * 링크를 여러 명이 동시에 열어도 서로의 글을 덮어쓰지 않는다.
 *
 * **생년월일은 서버로 오지 않는다.** 사주 계산은 브라우저에서 끝나고, 여기로는
 * "이 방의 캐릭터는 화(火)" 라는 결과값만 올라온다. 귀인지도와 같은 기조다.
 *
 * 비회원 소유권
 *   publicId  공유 링크에 노출되는 공개 id — 이걸로는 읽기만 된다
 *   token     브라우저 localStorage 에만 있는 비밀값 — 쓰기 권한 증명
 */

const TTL = 60 * 60 * 24 * 200; // 200일 — 쓸 때마다 늘어난다
const REWARD_TTL = 60 * 60 * 24 * 3; // 지급 표식은 날짜가 지나면 쓸모없다
const GUEST_COOLDOWN = 30; // 같은 사람이 한 방에 다시 쓰기까지(초)
const MAX_ENTRIES = 200;
const MAX_NICK = 12;
const MAX_MESSAGE = 200;

export class RoomError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "RoomError";
  }
}

interface RoomDoc {
  el: ElementKey;
  nick: string | null;
  decor: Decor;
  points: number;
  /** 사 둔 아이템 id — 중복 구매를 막고 꾸미기 저장을 검증한다 */
  owned: string[];
  /** 주인만 아는 열쇠 */
  token: string;
  at: number;
  /** 마지막으로 다녀간 시각 — 오래 비어 있는 방을 가려내는 데 쓴다 */
  seen: number;
}

interface EntryDoc {
  n: string;
  m: string;
  el?: ElementKey;
  at: number;
  /** 접속 지점 해시(IP) — 짧은 도배를 막는 데만 쓴다 */
  a: string;
  /** 브라우저 표식 해시 — 하루 한 줄 제한과 "내 글 지우기" 권한을 가린다 */
  v?: string;
}

const docKey = (id: string) => `game:room:${id}`;
const bookKey = (id: string) => `game:room:${id}:g`;
const rewardKey = (id: string, date: string) => `game:reward:${id}:${date}`;
const coolKey = (id: string, author: string) => `game:gb:${id}:${author}`;
const dayKey = (id: string, visitor: string) => `game:gbd:${id}:${visitor}`;

// 헷갈리기 쉬운 l·o·0·1 을 뺀 32글자. 256 % 32 === 0 이라 치우침 없이 고를 수 있다
const ALPHA = "abcdefghijkmnpqrstuvwxyz23456789";

function randomId(len: number): string {
  const b = new Uint8Array(len);
  crypto.getRandomValues(b);
  return Array.from(b, (n) => ALPHA[n % ALPHA.length]).join("");
}

/**
 * 글쓴이 표식.
 *
 * IP 를 그대로 남기지 않는다 — 도배를 막는 데 필요한 건 "같은 사람인가" 뿐이고,
 * 그건 해시로 충분하다. salt 를 환경변수로 받아 두면 저장된 해시만으로 IP 를
 * 되짚을 수 없다(안 넣어도 동작은 하지만 운영에서는 넣어 주세요).
 */
export function authorHashOf(req: Request): string {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  return saltedHash(ip);
}

/**
 * 브라우저 표식도 해시해서 넣는다.
 *
 * 표식 자체가 이미 의미 없는 난수지만, 저장해 두면 방 하나의 기록만 새어도
 * "이 브라우저가 저 방에도 다녀갔다" 를 맞춰볼 수 있다. 해시로 넣으면 저장된
 * 값끼리 이어붙일 수 없다. IP 해시와 같은 이유·같은 방식이다.
 */
export function visitorHashOf(raw: unknown): string | null {
  // 못 믿을 값이라 길이만 자르고 해시한다
  return typeof raw === "string" && raw.length >= 8 ? saltedHash(raw.slice(0, 64)) : null;
}

function saltedHash(input: string): string {
  const salt = process.env.GUESTBOOK_SALT ?? "fortunepot";
  return createHash("sha256").update(`${salt}:${input}`).digest("hex").slice(0, 32);
}

async function readDoc(id: string): Promise<RoomDoc> {
  const doc = await kv.getJSON<RoomDoc>(docKey(id));
  if (!doc) throw new RoomError(404, "방을 찾을 수 없어요. 링크가 만료되었을 수 있어요.");
  return doc;
}

async function writeDoc(id: string, doc: RoomDoc): Promise<void> {
  await kv.setJSON(docKey(id), { ...doc, seen: Date.now() }, TTL);
}

/** 주인만 지나갈 수 있는 문 */
async function readOwned(id: string, token: string | null): Promise<RoomDoc> {
  const doc = await readDoc(id);
  if (!token || token !== doc.token) throw new RoomError(403, "내 방만 고칠 수 있어요.");
  return doc;
}

function trimText(v: unknown, max: number): string {
  if (typeof v !== "string") return "";
  /*
   * 제어문자는 화면을 깨뜨리는 것 말고 쓸 데가 없다. 줄바꿈만 남긴다.
   * 정규식 대신 코드포인트를 세는 건, 이 파일이 UTF-8 로 오가는 동안 이스케이프가
   * 실제 제어문자로 굳어버리는 사고를 아예 없애기 위해서다.
   */
  let out = "";
  for (const ch of v) {
    const code = ch.codePointAt(0) ?? 0;
    if (code === 0x7f || (code < 0x20 && ch !== "\n")) continue;
    out += ch;
  }
  return out.trim().slice(0, max);
}

/** 카탈로그에 있고, 공짜이거나 사 둔 아이템만 방에 올릴 수 있다 */
function assertAffordable(decor: Decor, owned: string[]): void {
  for (const slot of SLOT_KEYS) {
    const id = decor[slot];
    if (!id || id === DEFAULT_ITEM[slot]) continue;
    const item = itemById(id);
    if (!item) throw new RoomError(400, "없는 아이템이에요.");
    if (item.price > 0 && !owned.includes(id)) {
      // 조사(은/는)가 아이템 이름의 받침에 따라 갈리므로 이름을 뒤에 둔다
      throw new RoomError(403, `아직 사지 않은 아이템이 있어요 — ${item.name}`);
    }
  }
}

function toView(id: string, doc: RoomDoc, owner: boolean, claimedToday?: boolean): RoomView {
  return {
    publicId: id,
    element: doc.el,
    nickname: doc.nick,
    decor: doc.decor,
    owner,
    ...(owner ? { points: doc.points, owned: doc.owned, claimedToday } : {}),
  };
}

/* ------------------------------------------------------------------ 바깥 API */

/** 방을 새로 만든다. 주인만 아는 열쇠를 함께 돌려준다. */
export async function createRoom(
  raw: unknown,
): Promise<{ publicId: string; token: string }> {
  const o = (raw ?? {}) as Record<string, unknown>;
  if (!isElementKey(o.element)) throw new RoomError(400, "캐릭터를 정할 수 없어요.");

  const publicId = randomId(10);
  const token = randomId(24);
  const nick = trimText(o.nickname, MAX_NICK);
  const decor = normalizeDecor(o.decor);
  // 처음 만들 땐 아직 아무것도 못 샀다 — 공짜 아이템만 들어올 수 있다
  assertAffordable(decor, []);

  await writeDoc(publicId, {
    el: o.element,
    nick: nick || null,
    decor,
    points: 0,
    owned: [],
    token,
    at: Date.now(),
    seen: Date.now(),
  });
  return { publicId, token };
}

/**
 * 방을 읽는다. 링크(publicId)만 있으면 누구나 볼 수 있고,
 * 열쇠가 맞으면 포인트·보유 아이템까지 함께 내려간다.
 */
export async function getRoom(id: string, token: string | null): Promise<RoomView> {
  const doc = await readDoc(id);
  const owner = !!token && token === doc.token;
  if (!owner) return toView(id, doc, false);

  // 주인에게는 오늘 몫을 이미 받았는지도 알려준다 — 화면의 출석 안내가 이걸 본다
  const claimed = await kv.getJSON<number>(rewardKey(id, seoulDateKey()));
  // 주인이 다녀갔으니 보관 기간을 늘려 둔다
  await writeDoc(id, doc);
  return toView(id, doc, true, claimed !== null);
}

/** 꾸미기·별명 저장 */
export async function patchRoom(
  id: string,
  token: string | null,
  raw: unknown,
): Promise<RoomView> {
  const doc = await readOwned(id, token);
  const o = (raw ?? {}) as Record<string, unknown>;

  if (o.decor !== undefined) {
    const decor = normalizeDecor(o.decor);
    assertAffordable(decor, doc.owned);
    doc.decor = decor;
  }
  if (o.nickname !== undefined) {
    doc.nick = trimText(o.nickname, MAX_NICK) || null;
  }
  await writeDoc(id, doc);
  return toView(id, doc, true);
}

/**
 * 출석 보상.
 *
 * 금액은 (방 id + 날짜) 로 이미 정해져 있고, 지급 여부만 NX 표식이 가른다.
 * 그래서 연타해도 같은 금액이 한 번만 들어간다.
 */
export async function claimReward(id: string, token: string | null): Promise<RewardResult> {
  const doc = await readOwned(id, token);
  const date = seoulDateKey();
  const amount = rollDailyReward(id, date);

  const first = await kv.setIfAbsent(rewardKey(id, date), amount, REWARD_TTL);
  if (!first) return { granted: false, amount, points: doc.points };

  doc.points += amount;
  await writeDoc(id, doc);
  return { granted: true, amount, points: doc.points };
}

/** 아이템 구매 — 잔액은 서버만 셈한다 */
export async function buyItem(
  id: string,
  token: string | null,
  raw: unknown,
): Promise<{ points: number; owned: string[] }> {
  const doc = await readOwned(id, token);
  const itemId = typeof (raw as { itemId?: unknown })?.itemId === "string"
    ? (raw as { itemId: string }).itemId
    : "";
  const item = itemById(itemId);

  if (!item) throw new RoomError(400, "없는 아이템이에요.");
  if (item.price === 0) throw new RoomError(400, "그건 그냥 쓸 수 있어요.");
  if (doc.owned.includes(itemId)) throw new RoomError(409, "이미 갖고 있어요.");
  if (doc.points < item.price) throw new RoomError(402, "포인트가 모자라요.");

  doc.points -= item.price;
  doc.owned = [...doc.owned, itemId];
  await writeDoc(id, doc);
  return { points: doc.points, owned: doc.owned };
}

/* ------------------------------------------------------------------- 방명록 */

const toEntry = (id: string, e: EntryDoc): GuestEntry => ({
  id,
  nickname: e.n,
  message: e.m,
  element: e.el ?? null,
  at: e.at,
});

/** 오래된 글이 위로 — 채팅창처럼 아래가 최신이다 */
export async function listGuestbook(id: string): Promise<GuestEntry[]> {
  const all = await kv.hGetAllJSON<EntryDoc>(bookKey(id));
  return Object.entries(all)
    .map(([eid, e]) => toEntry(eid, e))
    .sort((a, b) => a.at - b.at);
}

export async function addGuestbook(
  id: string,
  raw: unknown,
  author: string,
  visitor: string | null,
): Promise<GuestEntry> {
  // 없는 방(404)을 잘못된 입력(400)보다 먼저 알린다 — 링크가 죽은 게 진짜 원인이다
  await readDoc(id);

  const o = (raw ?? {}) as Record<string, unknown>;
  const nickname = trimText(o.nickname, MAX_NICK);
  const message = trimText(o.message, MAX_MESSAGE);

  if (!nickname) throw new RoomError(400, "이름을 입력해 주세요.");
  if (!message) throw new RoomError(400, "남길 말을 입력해 주세요.");
  /*
   * 링크는 막는다. 방명록 스팸은 거의 전부 주소를 심으러 오고, 금칙어 사전과 달리
   * 오탐이 적으면서 효과가 크다. 욕설 사전은 넣지 않았다 — 한국어에서 사전 방식은
   * 우회가 쉬운 데다 애먼 문장을 자주 막는다. 대신 주인이 지울 수 있게 했다.
   */
  if (/(https?:\/\/|www\.|\.(com|net|kr|io|me|xyz)\b)/i.test(message)) {
    throw new RoomError(400, "링크는 남길 수 없어요.");
  }

  /*
   * 한 방에 하루 한 줄.
   *
   * 화면에서도 막지만(브라우저 기록) 그건 안내일 뿐이라 여기서 한 번 더 건다.
   * 자물쇠는 **브라우저 표식** 으로 건다 — IP 로 걸면 같은 와이파이·통신사 NAT 뒤에
   * 있는 사람들이 서로의 하루치를 잡아먹는다. 표식이 없는 브라우저(스토리지 차단)는
   * 하루 자물쇠를 못 걸므로 아래 30초 IP 문턱만 받는다.
   *
   * 유효기간은 서울 자정까지다. 날짜를 키에 넣지 않고 만료로 처리하는 건, 자정을
   * 막 넘긴 사람이 "어제 걸린 자물쇠" 를 다시 만나지 않게 하기 위해서다.
   */
  if (visitor) {
    const until = Math.max(60, Math.ceil(msUntilNextReward() / 1000));
    const first = await kv.setIfAbsent(dayKey(id, visitor), 1, until);
    if (!first) throw new RoomError(429, "오늘은 이미 남겼어요. 내일 또 들러주세요.");
  }
  // 표식을 갈아가며 퍼붓는 경우까지는 IP 로 막는다. 짧게 잡아 NAT 피해를 줄인다
  const cooled = await kv.setIfAbsent(coolKey(id, author), 1, GUEST_COOLDOWN);
  if (!cooled) throw new RoomError(429, "잠시 후에 다시 남겨주세요.");

  const all = await kv.hGetAllJSON<EntryDoc>(bookKey(id));
  if (Object.keys(all).length >= MAX_ENTRIES) {
    throw new RoomError(409, "방명록이 가득 찼어요.");
  }

  const eid = randomId(12);
  const entry: EntryDoc = {
    n: nickname,
    m: message,
    el: isElementKey(o.element) ? o.element : undefined,
    at: Date.now(),
    a: author,
    v: visitor ?? undefined,
  };
  await kv.hSetJSON(bookKey(id), eid, entry);
  await kv.expire(bookKey(id), TTL);
  await kv.expire(docKey(id), TTL);
  return toEntry(eid, entry);
}

/**
 * 한 줄을 지운다. **방 주인과 글쓴이 본인** 둘 다 할 수 있다.
 *
 * 주인만 지울 수 있게 두면, 잘못 쓴 사람이 자기 글을 거둘 방법이 남의 호의밖에
 * 없다. 글쓴이는 브라우저 표식으로 가린다 — 로그인이 없으니 그것 말고는
 * "본인" 을 말할 방법이 없다.
 */
export async function removeGuestbook(
  id: string,
  token: string | null,
  entryId: string,
  visitor: string | null,
): Promise<void> {
  if (!entryId) throw new RoomError(400, "지울 글을 찾을 수 없어요.");

  const doc = await readDoc(id);
  if (token && token === doc.token) {
    await kv.hDel(bookKey(id), entryId);
    return;
  }

  const all = await kv.hGetAllJSON<EntryDoc>(bookKey(id));
  const entry = all[entryId];
  if (!entry) throw new RoomError(404, "이미 지워진 글이에요.");
  if (!visitor || entry.v !== visitor) {
    throw new RoomError(403, "내가 쓴 글만 지울 수 있어요.");
  }
  await kv.hDel(bookKey(id), entryId);
}
