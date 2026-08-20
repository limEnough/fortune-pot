"use client";
import type { JoinInput } from "./types";

/*
 * 공유 링크로 들어온 사람의 브라우저 표식.
 *
 * 로그인이 없으므로 "같은 사람"을 알아볼 방법이 입력값밖에 없는데, 다시 올리는
 * 이유는 대개 입력을 고치려는 것이라 입력으로는 같은 사람을 못 알아본다.
 * 그래서 무엇을 고치든 변하지 않는 임의 id 를 브라우저에 심어두고 함께 보낸다.
 *
 * 이 값으로 사람을 식별하지 않는다 — 서버는 해시만 저장하고, 한 지도 안에서
 * 같은 줄을 찾는 데만 쓴다. 스토리지를 막아둔 브라우저(시크릿창 등)에서는
 * 그냥 없는 채로 진행하고, 서버가 이름+생일로 한 번 더 걸러준다.
 */

const VISITOR = "fortunepot-visitor";
const JOINED = "fortunepot-joined";

function store(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null; // 스토리지 차단
  }
}

export function visitorId(): string | undefined {
  const s = store();
  if (!s) return undefined;
  let v = s.getItem(VISITOR) ?? undefined;
  if (!v) {
    const b = new Uint8Array(16);
    crypto.getRandomValues(b);
    v = Array.from(b, (n) => n.toString(16).padStart(2, "0")).join("");
    try {
      s.setItem(VISITOR, v);
    } catch {
      return undefined;
    }
  }
  return v;
}

/** 이 브라우저가 어느 지도에 무엇으로 올렸는지 — 폼을 채워두고 미리 알리는 데 쓴다 */
export type Joined = Omit<JoinInput, "visitor">;

type JoinedMap = Record<string, Joined>;

function readAll(): JoinedMap {
  const s = store();
  if (!s) return {};
  try {
    return JSON.parse(s.getItem(JOINED) ?? "{}") as JoinedMap;
  } catch {
    return {};
  }
}

export function readJoined(mapId: string): Joined | null {
  return readAll()[mapId] ?? null;
}

export function writeJoined(mapId: string, joined: Joined) {
  const s = store();
  if (!s) return;
  try {
    s.setItem(JOINED, JSON.stringify({ ...readAll(), [mapId]: joined }));
  } catch {
    // 용량이 찼거나 막힌 경우 — 안내만 못 할 뿐 합치기는 서버가 한다
  }
}
