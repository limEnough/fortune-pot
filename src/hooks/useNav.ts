"use client";
import { useCallback, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";

/**
 * 화면 전환용 라우터 래퍼.
 *
 * 전에는 전역 로딩 오버레이를 켜고 끄는 일까지 했지만, 지금은 라우트별
 * loading.tsx 가 전환 화면을 맡는다. 남은 역할은 같은 경로로의 무의미한
 * push 를 막는 것과, 화면 이동을 한 군데로 모으는 것.
 *
 * 돌려주는 객체는 **같은 것을 계속 돌려준다**(useMemo). 렌더마다 새로 만들면
 * 이 값을 의존성에 적은 useEffect 가 렌더마다 다시 돈다. 그 안에서 화면을 옮기는
 * 코드(조건이 안 맞아 다른 화면으로 보내는 자리들)는 이동을 시작할 때마다 다시
 * 렌더되므로, 시작한 이동이 끝나기 전에 또 시작하기를 반복해 **영영 도착하지
 * 못한다.** 화면은 스켈레톤에서 멈추고 오류는 하나도 안 뜬다.
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

  return useMemo(() => ({ push, replace, back }), [push, replace, back]);
}
