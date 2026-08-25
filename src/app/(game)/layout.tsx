import "../game.css";

/**
 * 게임 파트(내 방·꾸미기·남의 방) 공통 셸.
 *
 * 하는 일은 스타일을 한 번 불러오는 것뿐이다. 화면 껍데기(.app·별밤 배경·드로어)는
 * 루트 레이아웃의 AppShell 이 이미 씌워 준다. 라우트 그룹으로 묶은 건 이 CSS 가
 * 게임 화면에서만 실리게 하기 위해서다 — 운세·사주·귀인지도에는 필요 없다.
 */
export default function GameLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
