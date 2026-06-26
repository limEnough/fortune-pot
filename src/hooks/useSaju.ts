"use client";
import { useEffect, useState, useCallback } from "react";
import { useGuestStore } from "@/store/useGuestStore";
import type { SajuInput } from "@/types/saju";

/** 비회원(게스트) 전용 — 사주 정보는 localStorage(zustand persist)에 저장됩니다. */
export function useSaju() {
  const guest = useGuestStore();
  const [mounted, setMounted] = useState(false);

  // localStorage 하이드레이션 이후에만 값 사용(SSR 불일치 방지)
  useEffect(() => setMounted(true), []);

  const saju = mounted ? guest.saju : null;
  const loading = !mounted;

  const save = useCallback(
    async (input: SajuInput) => {
      guest.setSaju(input);
    },
    [guest]
  );

  return { saju, loading, save };
}
