"use client";
import { create } from "zustand";

interface ViewingState {
  /** 지금 열어 둔 남의 지도 */
  map: { id: string; ownerName: string } | null;
  setViewing: (id: string, ownerName: string) => void;
  clearViewing: () => void;
}

/**
 * 지금 보고 있는 '공유받은 지도'.
 *
 * 이름을 올리기 전에는 이 지도가 어디에도 저장되지 않는다 — 올려야 저장한다.
 * 그래도 그 화면에 있는 동안만큼은 메뉴가 "여기가 어디인지" 를 말해줘야 하므로
 * 화면이 살아 있는 동안만 사는 자리를 따로 둔다. 저장소가 아니라 메모리라
 * 새로고침하면 남지 않는다.
 *
 * 화면을 떠날 때 지우는 일은 여기서 하지 않는다. 라우트가 바뀔 때 새 화면이 먼저
 * 붙고 옛 화면이 나중에 떨어지는 순서라, 떠나는 쪽이 지우면 방금 앉힌 값을
 * 지워버린다. 대신 읽는 쪽(NavDrawer)이 지금 경로와 맞는지 보고 쓴다.
 */
export const useViewingStore = create<ViewingState>((set) => ({
  map: null,
  setViewing: (id, ownerName) => set({ map: { id, ownerName } }),
  clearViewing: () => set({ map: null }),
}));
