"use client";
import { usePathname } from "next/navigation";
import { useUIStore } from "@/store/useUIStore";
import { useRelease } from "@/hooks/useRelease";
import { useSaju } from "@/hooks/useSaju";
import { useNav } from "@/hooks/useNav";
import { isComplete } from "@/types/saju";

const Chev = () => (<svg className="chev" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>);
const X = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>);

export default function NavDrawer() {
  const nav = useNav();
  const pathname = usePathname();
  const { drawerOpen, closeDrawer } = useUIStore();
  const { saju } = useSaju();
  const { hasUpdate, openNote } = useRelease();

  const go = (path: string) => { closeDrawer(); nav.push(path); };

  // 드로어(z-index 51)가 릴리즈 시트(41)를 가리므로 먼저 닫는다
  const goNote = () => { closeDrawer(); openNote(); };

  /*
   * 어느 화면에서든 세 곳이 다 보인다.
   *
   * 예전엔 사주가 없으면 운세·사주 항목을 아예 숨겼다. 그래서 귀인지도만 하고 온
   * 사람의 메뉴에는 귀인지도 하나만 남았다. 지금은 늘 띄우고, 정보가 모자라면
   * 입력 폼을 거쳐 돌아오게 한다(성별만 비어 있으면 그 칸만 받는다).
   * 지금 보고 있는 화면은 눌리지 않는 표시로 남겨 위치를 알려준다.
   */
  const here = (path: string) =>
    path === "/map" ? pathname.startsWith("/map") : pathname === path;

  const Item = ({ path, label }: { path: string; label: string }) =>
    here(path) ? (
      <div className="nav-item current" aria-current="page">
        {label}<span className="nav-here">지금 화면</span>
      </div>
    ) : (
      <button className="nav-item focusable" onClick={() => go(path)}>
        {label}<Chev />
      </button>
    );

  return (
    <>
      <div className={`drawer-scrim ${drawerOpen ? "show" : ""}`} onClick={closeDrawer} />
      <nav className={`drawer ${drawerOpen ? "show" : ""}`} aria-label="메뉴">
        <div className="d-top">
          <div className="who">
            {saju?.name ?? "게스트"}님
            <small>
              {!saju
                ? "사주 정보를 입력해 주세요"
                : isComplete(saju)
                  ? "오늘의 운세가 준비됐어요"
                  : "몇 칸만 더 채우면 운세도 볼 수 있어요"}
            </small>
          </div>
          <button className="x focusable" aria-label="닫기" onClick={closeDrawer}><X /></button>
        </div>

        <div className="nav-group">
          <div className="g-lab">사주</div>
          <Item path="/fortune" label="오늘의 운세" />
          <Item path="/saju" label="나의 사주는" />
          {/* 사주 화면에서 들어왔으면 수정 후에도 사주 화면으로 돌려보낸다 */}
          <button
            className="nav-item focusable"
            onClick={() =>
              go(pathname === "/saju" ? "/onboarding?next=saju" : "/onboarding")
            }
          >
            {saju ? "사주정보 수정하기" : "사주정보 입력하기"}<Chev />
          </button>
        </div>

        <div className="nav-group">
          <div className="g-lab">관계</div>
          <Item path="/map" label="내 귀인지도" />
        </div>

        <div className="nav-group">
          <div className="g-lab">소식</div>
          <button className="nav-item focusable" onClick={goNote}>
            업데이트 소식
            {hasUpdate && <span className="nav-new">NEW</span>}
            <Chev />
          </button>
        </div>
      </nav>
    </>
  );
}
