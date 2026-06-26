"use client";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/store/useUIStore";
import { useSaju } from "@/hooks/useSaju";

const Chev = () => (<svg className="chev" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>);
const X = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>);

export default function NavDrawer() {
  const router = useRouter();
  const { drawerOpen, closeDrawer } = useUIStore();
  const { saju } = useSaju();

  const go = (path: string) => { closeDrawer(); router.push(path); };

  return (
    <>
      <div className={`drawer-scrim ${drawerOpen ? "show" : ""}`} onClick={closeDrawer} />
      <nav className={`drawer ${drawerOpen ? "show" : ""}`} aria-label="메뉴">
        <div className="d-top">
          <div className="who">
            {saju?.name ?? "게스트"}님
            <small>{saju ? "오늘의 운세가 준비됐어요" : "사주 정보를 입력해 주세요"}</small>
          </div>
          <button className="x focusable" aria-label="닫기" onClick={closeDrawer}><X /></button>
        </div>

        <div className="nav-group">
          <div className="g-lab">사주</div>
          <button className="nav-item focusable" onClick={() => go("/onboarding")}>
            {saju ? "사주정보 수정하기" : "사주정보 입력하기"}<Chev />
          </button>
          {saju && (
            <button className="nav-item focusable" onClick={() => go("/saju")}>나의 사주는<Chev /></button>
          )}
        </div>
      </nav>
    </>
  );
}
