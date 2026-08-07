"use client";
import { useEffect, useState } from "react";
import { isManseReady, loadManse } from "@/lib/saju/calc";

/**
 * 만세력(lunar-javascript) 지연 로딩 게이트.
 *
 * 명식을 그리는 화면은 이 훅이 true 를 줄 때까지 계산을 시작하면 안 됩니다.
 * computeSaju 는 동기 함수라, 모듈이 없으면 그냥 throw 합니다.
 *
 * 한 번 받아오면 모듈 스코프에 남으므로 화면을 다시 방문해도 로딩이 없습니다
 * (그래서 초기값을 isManseReady() 로 둬 불필요한 한 프레임을 건너뜁니다).
 */
export function useManse(): boolean {
  const [ready, setReady] = useState(isManseReady);

  useEffect(() => {
    if (ready) return;
    let alive = true;
    let timer: ReturnType<typeof setTimeout>;

    // 청크 로딩이 실패하면 스켈레톤에서 멈춰버리므로 몇 번은 다시 시도한다
    const attempt = (left: number) => {
      loadManse().then(
        () => alive && setReady(true),
        () => {
          if (!alive) return;
          if (left > 0) timer = setTimeout(() => attempt(left - 1), 1200);
          else console.error("만세력을 불러오지 못했습니다.");
        },
      );
    };
    attempt(3);

    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [ready]);

  return ready;
}
