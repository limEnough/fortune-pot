"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useUIStore } from "@/store/useUIStore";
import StarField from "./StarField";
import NavDrawer from "./NavDrawer";
import ReleaseNoteSheet from "./ReleaseNoteSheet";
import LoadingOverlay from "./LoadingOverlay";

/** 오버레이가 깜빡이고 마는 걸 막기 위한 최소 노출 시간(ms) */
const MIN_VISIBLE_MS = 450;
/** 어떤 이유로든 전환이 끝나지 않았을 때 오버레이가 화면을 영구히 잠그지 않도록 하는 안전장치(ms) */
const SAFETY_MS = 8000;

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { loading, loadingSince, loadingFrom, stopLoading } = useUIStore();

  // 도착(=경로 변화) 후 최소 노출 시간을 채우고 내린다
  useEffect(() => {
    if (!loading) return;
    if (loadingFrom !== null && pathname === loadingFrom) return; // 아직 이동 전
    const wait = Math.max(0, MIN_VISIBLE_MS - (Date.now() - loadingSince));
    const t = setTimeout(stopLoading, wait);
    return () => clearTimeout(t);
  }, [pathname, loading, loadingFrom, loadingSince, stopLoading]);

  // 전환이 끝내 완료되지 않아도 화면이 잠기지 않게
  useEffect(() => {
    if (!loading) return;
    const t = setTimeout(stopLoading, SAFETY_MS);
    return () => clearTimeout(t);
  }, [loading, stopLoading]);

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
      {loading && <LoadingOverlay text="잠시만 기다려 주세요" />}
    </div>
  );
}
