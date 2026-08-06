"use client";
import { useEffect, useState } from "react";
import { useReleaseStore } from "@/store/useReleaseStore";
import { LATEST_VERSION } from "@/lib/releases";

/**
 * 업데이트 소식 확인 상태.
 * 아직 안 본 릴리즈가 있으면 `hasUpdate === true` (헤더 말풍선·점 표시 기준).
 *
 * localStorage 하이드레이션 이후에만 true가 되므로 SSR 마크업과 어긋나지 않습니다.
 *
 * 첫 방문자(seenVersion === null)에게는 알리지 않습니다 — 처음 온 사람에게
 * '업데이트'는 없으니까요. 대신 방문 시점 버전을 바로 확인 처리해 두어야
 * **다음** 릴리즈부터 말풍선이 뜹니다. (안 그러면 null로 남아 영영 안 뜸)
 */
export function useRelease() {
  const seenVersion = useReleaseStore((s) => s.seenVersion);
  const noteOpen = useReleaseStore((s) => s.noteOpen);
  const openNote = useReleaseStore((s) => s.openNote);
  const closeNote = useReleaseStore((s) => s.closeNote);
  const markSeen = useReleaseStore((s) => s.markSeen);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // 첫 방문 기준점 심기 — 하이드레이션 이후 한 번만
  useEffect(() => {
    if (mounted && seenVersion === null) markSeen();
  }, [mounted, seenVersion, markSeen]);

  return {
    hasUpdate:
      mounted && seenVersion !== null && seenVersion !== LATEST_VERSION,
    noteOpen,
    openNote,
    closeNote,
    markSeen,
  };
}
