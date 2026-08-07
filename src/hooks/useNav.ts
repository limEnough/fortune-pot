"use client";
import { useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

/**
 * 화면 전환용 라우터 래퍼.
 *
 * 전에는 전역 로딩 오버레이를 켜고 끄는 일까지 했지만, 지금은 라우트별
 * loading.tsx 가 전환 화면을 맡는다. 남은 역할은 같은 경로로의 무의미한
 * push 를 막는 것과, 화면 이동을 한 군데로 모으는 것.
 */
export function useNav() {
  const router = useRouter();
  const pathname = usePathname();

  const push = useCallback(
    (path: string) => {
      if (path === pathname) return; // 같은 화면이면 전환이 없다
      router.push(path);
    },
    [router, pathname],
  );

  const replace = useCallback(
    (path: string) => {
      if (path === pathname) return;
      router.replace(path);
    },
    [router, pathname],
  );

  const back = useCallback(() => router.back(), [router]);

  return { push, replace, back };
}
