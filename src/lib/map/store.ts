import { kv } from "@/lib/kv";
import { loadManse, computeSaju, lunarToSolar, ohOfGan } from "@/lib/saju/calc";
import { chemistry } from "@/lib/saju/chemi";
import { ILGAN_NICK } from "@/lib/saju/text";
import type {
  Calendar, JoinInput, JoinResult, MapIntro, MapMember, MapView,
} from "./types";

/*
 * 귀인지도 서버 저장소.
 *
 * 키는 둘로 나눠 둔다.
 *   map:{id}    → 주인 문서(이름·생일·주인키)
 *   map:{id}:e  → 합류자 해시 (필드=합류자 id)
 *
 * 합류를 해시 필드 쓰기로 처리하면 문서 전체를 읽어 고쳐 쓸 일이 없다.
 * 링크를 여러 명이 동시에 열어도 서로의 글을 덮어쓰지 않는다.
 *
 * **생년월일은 서버 밖으로 나가지 않는다.** 궁합 계산이 여기서 끝나고,
 * 브라우저로는 이름·유형·점수·문구만 내려간다. 공유 링크를 주운 사람이
 * 주인의 생일을 알아낼 방법이 없어야 하기 때문이다.
 */

const TTL = 60 * 60 * 24 * 200; // 200일 — 쓸 때마다 늘어난다
const MAX_MEMBERS = 60;
const MAX_NAME = 12;

export class MapError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "MapError";
  }
}

interface OwnerDoc {
  name: string;
  /** 입력 원본(음력일 수 있다) */
  birth: string;
  cal: Calendar;
  /** 계산에 쓰는 양력 */
  solar: string;
  /** 0~11, 모르면 null/없음 */
  hour?: number | null;
  /** 주인만 아는 열쇠 — 지도 조회·삭제에 필요 */
  key: string;
  at: number;
}

interface EntryDoc {
  name: string;
  solar: string;
  hour?: number | null;
  /** 처음 올린 시각 — 고쳐 올려도 유지된다 */
  at: number;
  /** 방문자 토큰 해시 — 같은 사람인지 가리는 1차 기준 */
  v?: string;
}

const docKey = (id: string) => `map:${id}`;
const entKey = (id: string) => `map:${id}:e`;

// 헷갈리기 쉬운 l·o·0·1 을 뺀 32글자. 256 % 32 === 0 이라 치우침 없이 고를 수 있다
const ALPHA = "abcdefghijkmnpqrstuvwxyz23456789";

/** 링크에 들어가는 짧은 id — 받아적을 일은 없고 추측만 어려우면 된다 */
function randomId(len: number): string {
  const b = new Uint8Array(len);
  crypto.getRandomValues(b);
  return Array.from(b, (n) => ALPHA[n % ALPHA.length]).join("");
}

function hash36(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

/*
 * 같은 사람을 가리는 기준.
 *
 * 예전엔 이름+생일을 그대로 필드로 썼는데, 사람이 다시 올리는 이유는 대개
 * **고쳐 넣으려는 것**이라(이름 표기 변경·생일 오타·양음력 토글) 고칠 때마다
 * 다른 사람이 되어 줄이 쌓였다. 그래서 입력과 무관한 표식을 1차 기준으로 둔다.
 *
 *   1차: 방문자 토큰 — 브라우저가 들고 있는 임의 id. 무엇을 고쳐도 같은 사람.
 *   2차: 정규화한 이름+양력 생일 — 기기가 바뀌어 토큰이 없을 때.
 *
 * IP·기기 지문은 쓰지 않는다. 공용 와이파이에서 남의 줄을 덮어쓰는 실패가
 * 중복보다 나쁘다.
 */
const nameKey = (name: string, solar: string) =>
  `${name.normalize("NFC").replace(/\s+/g, "").toLowerCase()}|${solar}`;

const fieldOf = (visitorHash: string | null, nk: string) =>
  visitorHash ? `v${visitorHash}` : `n${hash36(nk)}`;

export function normalizeJoin(raw: unknown): JoinInput {
  const o = (raw ?? {}) as Record<string, unknown>;
  const name = typeof o.name === "string" ? o.name.trim().replace(/\s+/g, " ") : "";
  const birth = typeof o.birth === "string" ? o.birth.trim() : "";
  const cal: Calendar = o.cal === "lunar" ? "lunar" : "solar";
  // 모르면 null. 범위를 벗어난 값도 모르는 것으로 본다
  const hourIdx =
    typeof o.hourIdx === "number" && o.hourIdx >= 0 && o.hourIdx <= 11
      ? Math.floor(o.hourIdx)
      : null;
  // 브라우저가 만든 임의 문자열. 못 믿을 값이므로 길이만 자르고 그대로 해시한다
  const visitor =
    typeof o.visitor === "string" && o.visitor.length >= 8
      ? o.visitor.slice(0, 64)
      : undefined;

  if (!name) throw new MapError(400, "이름을 입력해 주세요.");
  if (name.length > MAX_NAME) throw new MapError(400, `이름은 ${MAX_NAME}자까지 넣을 수 있어요.`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birth)) throw new MapError(400, "생년월일을 다시 확인해 주세요.");

  const [y, m, d] = birth.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const real = dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
  const thisYear = new Date().getFullYear();
  if (!real || y < 1900 || y > thisYear) {
    throw new MapError(400, "생년월일을 다시 확인해 주세요.");
  }
  return { name, birth, cal, hourIdx, visitor };
}

/** 음력이면 양력으로 옮겨둔다 — 이후 계산은 전부 양력 기준 */
async function toSolar(input: JoinInput): Promise<string> {
  await loadManse();
  return input.cal === "lunar" ? lunarToSolar(input.birth) : input.birth;
}

function ownerOf(doc: OwnerDoc) {
  const sj = computeSaju(doc.solar, doc.hour ?? null);
  const nick = ILGAN_NICK[sj.ilgan];
  return {
    sj,
    view: {
      name: doc.name,
      ohaeng: ohOfGan(sj.ilgan) as string,
      emoji: nick.emoji,
      nick: nick.nick,
    },
  };
}

function toMember(id: string, e: EntryDoc, ownerSj: ReturnType<typeof computeSaju>): MapMember {
  return {
    id,
    name: e.name,
    at: e.at,
    ...chemistry(ownerSj, computeSaju(e.solar, e.hour ?? null)),
  };
}

async function readDoc(id: string): Promise<OwnerDoc> {
  const doc = await kv.getJSON<OwnerDoc>(docKey(id));
  if (!doc) throw new MapError(404, "지도를 찾을 수 없어요. 링크가 만료되었을 수 있어요.");
  return doc;
}

/* ------------------------------------------------------------------ 바깥 API */

/** 지도를 새로 만든다. 주인만 아는 key 를 함께 돌려준다. */
export async function createMap(
  raw: unknown,
): Promise<{ id: string; key: string; solar: string }> {
  const input = normalizeJoin(raw);
  const solar = await toSolar(input);
  const id = randomId(10);
  const key = randomId(22);
  const doc: OwnerDoc = {
    name: input.name,
    birth: input.birth,
    cal: input.cal,
    solar,
    hour: input.hourIdx,
    key,
    at: Date.now(),
  };
  await kv.setJSON(docKey(id), doc, TTL);
  // solar 를 돌려주는 건 브라우저가 이 정보를 사주로도 심어두기 위해서다.
  // 음력을 넣었다면 변환 결과를 서버만 알고 있다(만세력이 서버에 있으므로).
  return { id, key, solar };
}

/** 공유 링크로 들어온 사람에게 보여줄 것 — 주인 이름과 인원수뿐 */
export async function getIntro(id: string): Promise<MapIntro> {
  const doc = await readDoc(id);
  const entries = await kv.hGetAllJSON<EntryDoc>(entKey(id));
  return { id, ownerName: doc.name, count: Object.keys(entries).length };
}

/**
 * 지도를 펼쳐 본다. 두 사람만 열 수 있다.
 *
 *   - 주인: 열쇠(key)를 가진 사람. 지우기까지 할 수 있다.
 *   - 합류자: 이 지도에 자기 이름을 올린 사람. 읽기만 한다(mine 으로 자기 별을 표시).
 *
 * 링크만 주운 사람은 열 수 없다. 참여자 명단이 그대로 퍼지는 걸 막으면서도,
 * 이름을 올린 사람에게는 "내가 이 사람들 사이 어디쯤인지" 를 돌려주기 위해서다.
 */
export async function getMap(
  id: string,
  key: string | null,
  visitor?: string | null,
): Promise<MapView> {
  const doc = await readDoc(id);
  const owner = !!key && key === doc.key;

  await loadManse();
  const { sj, view } = ownerOf(doc);
  const entries = await kv.hGetAllJSON<EntryDoc>(entKey(id));

  const vh = visitor ? hash36(visitor) : null;
  const mine = vh ? Object.entries(entries).find(([, e]) => e.v === vh)?.[0] : undefined;
  if (!owner && !mine) {
    throw new MapError(403, "먼저 이 지도에 이름을 올려야 볼 수 있어요.");
  }

  const members = Object.entries(entries)
    .map(([eid, e]) => toMember(eid, e, sj))
    .sort((a, b) => b.score - a.score || a.at - b.at);

  return { id, owner: view, members, role: owner ? "owner" : "member", mine };
}

/** 공유 링크에서 이름을 올린다. 결과(내가 주인에게 어떤 사람인지)를 돌려준다. */
export async function joinMap(id: string, raw: unknown): Promise<JoinResult> {
  const doc = await readDoc(id);
  const input = normalizeJoin(raw);
  const solar = await toSolar(input);

  const entries = await kv.hGetAllJSON<EntryDoc>(entKey(id));
  const nk = nameKey(input.name, solar);
  const vh = input.visitor ? hash36(input.visitor) : null;
  const eid = fieldOf(vh, nk);

  /*
   * 같은 사람이 이미 올린 줄을 모은다. 표기를 바꿔가며 여러 번 올렸다면 여기서
   * 여러 개가 잡히고, 아래에서 한 줄로 합친다.
   *
   * 2차 기준은 저장해 둔 값이 아니라 그때그때 계산한다. 이 방식 이전에 쌓인 줄도
   * 이름과 양력 생일은 들고 있으므로 같은 규칙으로 걸리고, 살아 있는 지도를
   * 손볼 필요가 없다.
   */
  const prior = Object.entries(entries).filter(
    ([, e]) => (vh && e.v === vh) || nameKey(e.name, e.solar) === nk,
  );

  if (!prior.length && Object.keys(entries).length >= MAX_MEMBERS) {
    throw new MapError(409, `한 지도에는 ${MAX_MEMBERS}명까지 올릴 수 있어요.`);
  }

  const entry: EntryDoc = {
    name: input.name,
    solar,
    hour: input.hourIdx,
    // 처음 올린 시각은 지킨다 — 고쳐 올렸다고 새로 온 사람이 되는 건 아니다
    at: prior.length ? Math.min(...prior.map(([, e]) => e.at)) : Date.now(),
    v: vh ?? undefined,
  };
  await kv.hSetJSON(entKey(id), eid, entry);
  // 표기가 바뀌어 다른 필드에 남아 있던 예전 줄을 걷어낸다
  for (const [f] of prior) if (f !== eid) await kv.hDel(entKey(id), f);
  await kv.expire(entKey(id), TTL);
  await kv.expire(docKey(id), TTL);

  const { sj } = ownerOf(doc);
  const member = toMember(eid, entry, sj);
  const mine = new Set(prior.map(([f]) => f).concat(eid));
  // "이 지도의 N번째 단짝" — 나를 포함해 센다
  const sameRole =
    Object.entries(entries).filter(
      ([k, e]) => !mine.has(k) && toMember(k, e, sj).role === member.role,
    ).length + 1;

  return {
    ownerName: doc.name,
    member,
    sameRole,
    role: member.role,
    solar,
    updated: prior.length > 0,
  };
}

/** 주인이 한 명을 지운다 */
export async function removeMember(id: string, key: string | null, memberId: string) {
  const doc = await readDoc(id);
  if (!key || key !== doc.key) throw new MapError(403, "내 지도만 고칠 수 있어요.");
  await kv.hDel(entKey(id), memberId);
}
