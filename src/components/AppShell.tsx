"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useUIStore } from "@/store/useUIStore";
import StarField from "./StarField";
import NavDrawer from "./NavDrawer";
import ReleaseNoteSheet from "./ReleaseNoteSheet";

/*
 * 화면 전환 로딩은 더 이상 여기서 다루지 않는다.
 *
 * 예전엔 이동을 시작할 때 전역 오버레이를 띄우고 최소 450ms 를 채운 뒤 내렸다.
 * 도착할 화면에 대한 정보를 하나도 주지 못하는 데다, 실제 전환이 그보다 빠를 때는
 * 일부러 기다리게 만드는 셈이었다.
 *
 * 지금은 각 라우트의 loading.tsx 가 그 화면의 스켈레톤을 띄운다. Next 가
 * 세그먼트를 Suspense 로 감싸주므로 전환이 빠르면 스켈레톤도 그만큼 짧게 스친다.
 */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // 드로어를 열어둔 채 이동하면 새 화면에 드로어가 남는다
  const closeDrawer = useUIStore((s) => s.closeDrawer);
  useEffect(() => {
    closeDrawer();
  }, [pathname, closeDrawer]);

  return (
    <div className="app">
      <StarField />
      {children}
      <NavDrawer />
      <ReleaseNoteSheet />
    </div>
  );
}
