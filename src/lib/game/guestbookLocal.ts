"use client";
import { seoulDateKey } from "./reward";

/*
 * 방명록에 대해 브라우저가 기억하는 두 가지.
 *
 *   1) 오늘 이 방에 글을 남겼는지 — 하루 한 줄 안내
 *   2) 내가 쓴 글의 id — 그 줄에만 지우기 버튼을 세운다
 *
 * 서버도 같은 규칙을 걸지만(브라우저 표식 기준 하루 자물쇠 · 표식이 맞을 때만 삭제)
 * 그건 막는 쪽이고 이건 **알리는 쪽**이다. 다 쓰고 나서 "오늘은 이미 남겼어요" 를
 * 만나는 것보다 쓰기 전에 아는 편이 낫다.
 *
 * "내 글" 을 서버가 표시해 주지 않는 건, 공유된 방 화면이 서버에서 그려질 때
 * 그 브라우저가 누구인지 알 수 없어서다. 대신 남길 때 받은 id 를 여기 적어둔다.
 * 기록을 지우면 내 글도 못 지운다 — 그때는 방 주인에게 부탁하는 수밖에 없다.
 *
 * 날짜는 서울 기준이라 자정 롤오버가 서버와 같다(`reward.ts` 의 seoulDateKey).
 */

const KEY = "fortunepot-guestbook";

/** 남의 방 링크를 여럿 다녀도 브라우저에 방 id 가 끝없이 쌓이지 않게 */
const MAX_ROOMS = 20;

interface Rec {
  /** 마지막으로 글을 남긴 날 (YYYY-MM-DD) */
  d?: string;
  /** 내가 쓴 글 id */
  ids?: string[];
  /** 마지막으로 손댄 시각 — 넘칠 때 밀려날 순서를 정한다 */
  at?: number;
}

type All = Record<string, Rec>;

function read(): All {
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? "{}") as All;
  } catch {
    return {}; // 스토리지 차단·깨진 값 — 제한은 어차피 서버가 건다
  }
}

function write(all: All): void {
  const ids = Object.keys(all);
  const kept =
    ids.length <= MAX_ROOMS
      ? all
      : Object.fromEntries(
          ids
            .sort((a, b) => (all[b].at ?? 0) - (all[a].at ?? 0))
            .slice(0, MAX_ROOMS)
            .map((id) => [id, all[id]]),
        );
  try {
    window.localStorage.setItem(KEY, JSON.stringify(kept));
  } catch {
    /* 저장 실패는 치명적이지 않다 — 안내를 못 할 뿐이다 */
  }
}

export function wroteToday(publicId: string): boolean {
  return read()[publicId]?.d === seoulDateKey();
}

/** 이 방에서 내가 쓴 글 id */
export function myEntryIds(publicId: string): string[] {
  return read()[publicId]?.ids ?? [];
}

export function rememberEntry(publicId: string, entryId: string): void {
  const all = read();
  const rec = all[publicId] ?? {};
  write({
    ...all,
    [publicId]: {
      d: seoulDateKey(),
      ids: [...(rec.ids ?? []), entryId],
      at: Date.now(),
    },
  });
}

export function forgetEntry(publicId: string, entryId: string): void {
  const all = read();
  const rec = all[publicId];
  if (!rec?.ids) return;
  // 날짜(d)는 그대로 둔다 — 지웠다고 오늘 몫이 되돌아오면 하루 한 줄이 무너진다
  write({ ...all, [publicId]: { ...rec, ids: rec.ids.filter((x) => x !== entryId) } });
}
