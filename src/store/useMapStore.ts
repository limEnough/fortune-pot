"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface MapState {
  /** 공유 링크에 들어가는 지도 id */
  id: string | null;
  /** 주인만 아는 열쇠 — 이게 있어야 지도를 열어볼 수 있다 */
  key: string | null;
  setMap: (id: string, key: string) => void;
  clear: () => void;
}

/**
 * 내 귀인지도의 주소록.
 *
 * 지도 내용은 서버(KV)에 있고 브라우저에는 id·key 만 남는다. 이 둘을 잃으면
 * 지도를 다시 열 수 없으므로(비회원이라 되찾을 계정이 없다) 지우기 전에
 * 반드시 확인을 받는다.
 */
export const useMapStore = create<MapState>()(
  persist(
    (set) => ({
      id: null,
      key: null,
      setMap: (id, key) => set({ id, key }),
      clear: () => set({ id: null, key: null }),
    }),
    { name: "fortunepot-map" },
  ),
);
