import { FortuneSkeletonScreen } from "@/components/Skeleton";

/**
 * 라우트 전환 중 보여줄 화면.
 *
 * 예전엔 AppShell 이 전역 오버레이로 화면을 덮었는데, 도착할 화면에 대한
 * 정보를 하나도 주지 못했다. App Router 의 loading 규약을 쓰면 Next 가
 * 세그먼트를 Suspense 로 감싸 이 스켈레톤을 대신 띄운다.
 */
export default function Loading() {
  return <FortuneSkeletonScreen />;
}
