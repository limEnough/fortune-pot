"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SajuInput } from "@/types/saju";

interface GuestState {
  saju: SajuInput | null;
  setSaju: (s: SajuInput) => void;
  clear: () => void;
}

/** 비로그인(게스트) 사주 정보 — localStorage 영속. 로그인 시 Supabase로 동기화. */
export const useGuestStore = create<GuestState>()(
  persist(
    (set) => ({
      saju: null,
      setSaju: (s) => set({ saju: s }),
      clear: () => set({ saju: null }),
    }),
    { name: "fortunepot-guest" }
  )
);
