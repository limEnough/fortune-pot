"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { LATEST_VERSION } from "@/lib/releases";

interface ReleaseState {
  /** 사용자가 마지막으로 확인한 릴리즈 버전. null이면 아직 한 번도 안 봄 */
  seenVersion: string | null;
  /** 릴리즈 노트 시트 열림 여부 */
  noteOpen: boolean;
  openNote: () => void;
  closeNote: () => void;
  /** 최신 버전을 확인 처리 */
  markSeen: () => void;
}

/** 업데이트 소식 확인 여부 — localStorage 영속 */
export const useReleaseStore = create<ReleaseState>()(
  persist(
    (set) => ({
      seenVersion: null,
      noteOpen: false,
      openNote: () => set({ noteOpen: true, seenVersion: LATEST_VERSION }),
      closeNote: () => set({ noteOpen: false }),
      markSeen: () => set({ seenVersion: LATEST_VERSION }),
    }),
    {
      name: "fortunepot-release",
      // 열림 상태는 저장하지 않음
      partialize: (s) => ({ seenVersion: s.seenVersion }),
    }
  )
);
