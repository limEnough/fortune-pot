"use client";
import { useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUIStore } from "@/store/useUIStore";

/**
 * 화면 전환용 라우터 래퍼.
 *
 * App Router의 클라이언트 내비게이션은 전환 이벤트를 노출하지 않아서
 * (Pages Router의 router.events 같은 게 없음) 전환 중임을 알 방법이 없습니다.
 * 그래서 이동을 시작할 때 직접 로딩을 켜고, AppShell이 pathname 변화를 보고 끕니다.
 *
 * 화면 이동은 전부 이 훅을 거쳐야 로딩 오버레이가 붙습니다.
 */
export function useNav() {
  const router = useRouter();
  const pathname = usePathname();
  const startLoading = useUIStore((s) => s.startLoading);

  const push = useCallback(
    (path: string) => {
      if (path === pathname) return; // 같은 화면이면 전환이 없으니 로딩도 없다
      startLoading(pathname);
      router.push(path);
    },
    [router, pathname, startLoading],
  );

  const replace = useCallback(
    (path: string) => {
      if (path === pathname) return;
      startLoading(pathname);
      router.replace(path);
    },
    [router, pathname, startLoading],
  );

  const back = useCallback(() => {
    startLoading(pathname);
    router.back();
  }, [router, pathname, startLoading]);

  return { push, replace, back };
}
