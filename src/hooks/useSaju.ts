"use client";
import { useEffect, useState, useCallback } from "react";
import { useGuestStore } from "@/store/useGuestStore";
import type { SajuInput } from "@/types/saju";

/* ──────────────────────────────────────────────────────────────
 * ⚠️ 현재 Supabase를 사용할 수 없어 "비회원(게스트) 전용"으로 동작합니다.
 *    사주 정보는 localStorage(zustand persist)에만 저장됩니다.
 *    로그인 기능을 복구하려면 아래 주석 처리된 Supabase 코드를 되살리세요.
 * ────────────────────────────────────────────────────────────── */
// import type { User } from "@supabase/supabase-js";
// import { createClient } from "@/lib/supabase/client";
//
// interface ProfileRow { name: string; birth_date: string; hour_idx: number | null; gender: "남" | "여"; }
// const rowToInput = (r: ProfileRow): SajuInput => ({
//   name: r.name, birth: r.birth_date, hourIdx: r.hour_idx, gender: r.gender,
// });

export function useSaju() {
  const guest = useGuestStore();
  const [mounted, setMounted] = useState(false);

  // localStorage 하이드레이션 이후에만 값 사용(SSR 불일치 방지)
  useEffect(() => setMounted(true), []);

  /* ── 로그인 모드(보관용) ─────────────────────────────────────
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<SajuInput | null>(null);
  useEffect(() => {
    let active = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!active) return;
      setUser(user);
      if (user) {
        const { data } = await supabase
          .from("saju_profiles")
          .select("name,birth_date,hour_idx,gender")
          .eq("user_id", user.id)
          .maybeSingle();
        if (active && data) setProfile(rowToInput(data as ProfileRow));
      }
    })();
    return () => { active = false; };
  }, []);
  ──────────────────────────────────────────────────────────── */

  const user = null;                         // 비회원 모드: 항상 null
  const saju = mounted ? guest.saju : null;  // 게스트 저장소에서만 읽음
  const loading = !mounted;

  const save = useCallback(
    async (input: SajuInput) => {
      guest.setSaju(input);
      // 로그인 모드: await supabase.from("saju_profiles").upsert({ user_id, ...input })
    },
    [guest]
  );

  return { user, saju, loading, save, loggedIn: false };
}
