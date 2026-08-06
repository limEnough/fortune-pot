"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/store/useUIStore";
import { useRelease } from "@/hooks/useRelease";

const Back = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>);
const Home = () => (<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l9-8 9 8" /><path d="M5 10v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9" /></svg>);
const Menu = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>);
const Megaphone = () => (<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11v2a2 2 0 0 0 2 2h2l9 4V5L7 9H5a2 2 0 0 0-2 2z" /><path d="M7 15v3.5A1.5 1.5 0 0 0 8.5 20h1a1.5 1.5 0 0 0 1.5-1.5V16.4" /><path d="M19.6 9.6a3.4 3.4 0 0 1 0 4.8" /></svg>);

/** 말풍선이 저절로 사라지기까지(ms). 사라져도 버튼의 빨간 점은 남습니다. */
const BUBBLE_MS = 6000;

interface Props {
  back?: boolean;
  home?: boolean;
  menu?: boolean;
  brand?: boolean;
}

export default function TopBar({ back, home, menu, brand }: Props) {
  const router = useRouter();
  const openDrawer = useUIStore((s) => s.openDrawer);
  const { hasUpdate, openNote } = useRelease();
  const [bubble, setBubble] = useState(false);

  // 안 본 업데이트가 있으면 잠깐 말풍선으로 알리고, 이후엔 점만 남긴다
  useEffect(() => {
    if (!hasUpdate) return setBubble(false);
    setBubble(true);
    const t = setTimeout(() => setBubble(false), BUBBLE_MS);
    return () => clearTimeout(t);
  }, [hasUpdate]);

  const showNote = () => {
    setBubble(false);
    openNote();
  };

  return (
    <div className="topbar">
      {back && <button className="back focusable" aria-label="뒤로" onClick={() => router.back()}><Back /></button>}
      {brand && <div className="brandmark">오늘의 <b>사주</b></div>}
      <div className="spacer" />

      <div className="news-wrap">
        <button
          className={`menu news focusable ${hasUpdate ? "dot" : ""}`}
          aria-label={hasUpdate ? "새 업데이트 소식 보기" : "업데이트 소식"}
          onClick={showNote}
        >
          <Megaphone />
        </button>
        {bubble && (
          <button className="news-bubble focusable" onClick={showNote}>
            업데이트 내역을 확인해보세요!
          </button>
        )}
      </div>

      {home && <button className="menu focusable" aria-label="홈" onClick={() => router.push("/")}><Home /></button>}
      {menu && <button className="menu focusable" aria-label="메뉴" onClick={openDrawer}><Menu /></button>}
    </div>
  );
}
