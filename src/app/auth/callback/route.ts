import { NextResponse } from "next/server";

/* OAuth/매직링크 콜백은 현재 비활성화되어 있습니다(비회원 전용).
   로그인 복구 시 아래 주석된 원본을 되살리세요. */
export async function GET(request: Request) {
  const { origin } = new URL(request.url);
  return NextResponse.redirect(`${origin}/`);
}

/* ── 원본(보관용) ───────────────────────────────────────────────
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }
  return NextResponse.redirect(`${origin}/`);
}
──────────────────────────────────────────────────────────────── */
