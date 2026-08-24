"use client";
import { useGuestStore } from "@/store/useGuestStore";
import { useSessionStore } from "@/store/useSessionStore";
import type { JoinInput } from "./types";

/**
 * 지도에 넣은 정보를 사주로도 심어둔다.
 *
 * 귀인지도만 하고 나간 사람이 메인에 오면 아무것도 없는 새 방문자로 보였다.
 * 방금 이름·생일·시간을 다 넣었는데 운세를 보려면 또 입력해야 했다. 그래서
 * 지도를 만들거나 이름을 올린 순간 그 값을 게스트 사주로 옮기고, 이번 세션은
 * 확인된 것으로 친다 — 자기가 방금 넣은 값을 다시 물어볼 이유가 없다.
 *
 * **이미 저장된 사주가 있으면 건드리지 않는다.** 남의 지도에 이름을 올렸다고
 * 내 사주가 바뀌면 안 되고, 다른 정보로 지도를 만든 경우도 마찬가지다.
 *
 * 성별은 비워 둔다(지도는 받지 않는다). 사주·운세 화면으로 갈 때 입력 폼이
 * 나머지 값을 채운 채로 성별만 받는다.
 */
export function plantSaju(input: JoinInput, solar: string) {
  const guest = useGuestStore.getState();
  if (guest.saju) return;

  guest.setSaju({
    name: input.name,
    birth: solar,
    hourIdx: input.hourIdx,
    gender: null,
  });
  useSessionStore.getState().confirm();
}
