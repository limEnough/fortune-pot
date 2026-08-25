"use client";
import type { JoinInput } from "./types";

/*
 * 이 브라우저가 다녀온 남의 지도들.
 *
 * 브라우저 표식(`visitorId`) 자체는 방명록도 함께 쓰게 되어 `lib/visitor.ts` 로
 * 올려 두었다. 여기 남은 건 지도에만 해당하는 것 — 어느 지도에 무엇으로 이름을
 * 올렸는지, 그래서 메뉴에 무엇을 세울지다.
 */

const JOINED = "fortunepot-joined";

function store(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null; // 스토리지 차단
  }
}

/** 이 브라우저가 어느 지도에 무엇으로 올렸는지 — 폼을 채워두고 미리 알리는 데 쓴다 */
export type Joined = Omit<JoinInput, "visitor">;

/*
 * 저장 형태는 Joined 에 두 칸을 더 얹은 것이다.
 *
 * 이름을 올린 지도는 메뉴에 "OOO님의 귀인지도" 로 남아 다시 찾아갈 수 있어야 한다.
 * 그러려면 주인 이름과 올린 시간이 필요한데, 이 방식 이전에 쌓인 기록에는 둘 다
 * 없다. 그래서 없어도 되는 값으로 두고 읽을 때 메운다 — 살아 있는 브라우저의
 * 기록을 버리지 않기 위해서다.
 */
type JoinedRec = Joined & {
  /** 지도 주인 이름 — 메뉴에 "OOO님의 귀인지도" 로 세운다 */
  owner?: string;
  /** 마지막으로 다녀온 시간 — 메뉴 차례와 밀려날 순서를 정한다 */
  at?: number;
};

type JoinedMap = Record<string, JoinedRec>;

/** 메뉴에 세울 한 줄 — 어느 지도를, 누구 것으로 */
export type JoinedRef = { id: string; owner?: string };

/**
 * 들고 있을 지도 수 — 최근에 다녀온 것부터 이만큼만 남기고 나머지는 버린다.
 *
 * 버려진 지도는 메뉴에서 사라지고, 그 링크를 다시 열면 폼이 빈 채로 뜬다(서버에는
 * 그대로 있으므로 다시 올리면 줄이 늘지 않고 합쳐진다). 브라우저에 남의 지도
 * 기록이 끝없이 쌓이지 않게 하는 값이라, 메뉴에 세우는 수와 같은 값을 쓴다.
 */
export const MAX_JOINED = 5;

/** 최근 것부터 MAX_JOINED 개만 남긴다 — 시간을 모르는 옛 기록이 가장 먼저 밀린다 */
function prune(all: JoinedMap): JoinedMap {
  const ids = Object.keys(all);
  if (ids.length <= MAX_JOINED) return all;
  const keep = ids
    .sort((a, b) => (all[b].at ?? 0) - (all[a].at ?? 0))
    .slice(0, MAX_JOINED);
  return Object.fromEntries(keep.map((id) => [id, all[id]]));
}

function readAll(): JoinedMap {
  const s = store();
  if (!s) return {};
  try {
    return JSON.parse(s.getItem(JOINED) ?? "{}") as JoinedMap;
  } catch {
    return {};
  }
}

function writeAll(all: JoinedMap) {
  const s = store();
  if (!s) return;
  try {
    s.setItem(JOINED, JSON.stringify(all));
  } catch {
    // 용량이 찼거나 막힌 경우 — 안내만 못 할 뿐 합치기는 서버가 한다
  }
}

export function readJoined(mapId: string): Joined | null {
  return readAll()[mapId] ?? null;
}

export function writeJoined(mapId: string, joined: Joined, owner?: string) {
  const all = readAll();
  writeAll(
    prune({
      ...all,
      // 이름 없이 부른 호출이어도 전에 알아둔 주인 이름은 지우지 않는다
      [mapId]: { ...joined, owner: owner ?? all[mapId]?.owner, at: Date.now() },
    }),
  );
}

/**
 * 다녀왔다고 표시한다 — 이미 들고 있는 지도만.
 *
 * 이름을 올리지 않은 지도는 여기서 새로 만들지 않는다. 그런 지도는 그 화면에
 * 있는 동안만 메뉴에 얹혔다가 떠나면 사라지는 것이 기조라, 저장해 두면 지울
 * 시점을 따로 잡아야 한다(뒤로가기·탭 닫기까지 걸러낼 방법이 마땅치 않다).
 *
 * 이미 올린 지도라면 차례를 맨 위로 끌어올리고, 주인 이름도 방금 받아온 값으로
 * 고쳐 둔다 — 주인이 이름을 바꿨을 수 있다.
 */
export function touchJoined(mapId: string, owner?: string) {
  const all = readAll();
  const rec = all[mapId];
  if (!rec) return;
  writeAll(
    prune({
      ...all,
      [mapId]: { ...rec, owner: owner ?? rec.owner, at: Date.now() },
    }),
  );
}

/** 다녀온 지도들 — 최근에 다녀온 것부터. 시간을 모르는 옛 기록은 뒤로 */
export function listJoined(): JoinedRef[] {
  return Object.entries(readAll())
    .map(([id, r]) => ({ id, owner: r.owner, at: r.at ?? 0 }))
    .sort((a, b) => b.at - a.at)
    .slice(0, MAX_JOINED) // 이 방식 이전에 쌓인 기록은 아직 안 잘려 있을 수 있다
    .map(({ id, owner }) => ({ id, owner }));
}

/** 만료돼 사라진 지도를 목록에서 걷어낸다 — 열리지 않는 줄이 메뉴에 남지 않게 */
export function forgetJoined(mapId: string) {
  const all = readAll();
  if (!(mapId in all)) return;
  delete all[mapId];
  writeAll(all);
}
