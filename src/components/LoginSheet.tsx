"use client";
/* ──────────────────────────────────────────────────────────────
 * ⚠️ 로그인 시트는 현재 비활성화되어 있습니다(비회원 전용).
 *    Supabase 인증을 복구하려면 아래 주석된 원본 구현을 되살리세요.
 * ────────────────────────────────────────────────────────────── */
export default function LoginSheet(_props: { open: boolean; onClose: () => void }) {
  return null;
}

/* ── 원본(보관용) ───────────────────────────────────────────────
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function LoginSheetOriginal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? (typeof window !== "undefined" ? window.location.origin : "");

  const google = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${siteUrl}/auth/callback` },
    });
  };
  const emailLogin = async () => {
    if (!email) return;
    const { error } = await supabase.auth.signInWithOtp({
      email, options: { emailRedirectTo: `${siteUrl}/auth/callback` },
    });
    if (!error) setSent(true);
  };
  // ... 구글/이메일 버튼 UI ...
}
──────────────────────────────────────────────────────────────── */
