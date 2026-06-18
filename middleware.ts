import { NextResponse, type NextRequest } from "next/server";

/* ──────────────────────────────────────────────────────────────
 * ⚠️ Supabase 미사용(비회원 전용) — 세션 갱신 미들웨어를 비활성화했습니다.
 *    그대로 통과시키기만 합니다. 로그인 복구 시 아래 원본을 되살리세요.
 * ────────────────────────────────────────────────────────────── */
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};

/* ── 원본(보관용) ───────────────────────────────────────────────
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(toSet) {
          toSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );
  await supabase.auth.getUser();
  return response;
}
──────────────────────────────────────────────────────────────── */
