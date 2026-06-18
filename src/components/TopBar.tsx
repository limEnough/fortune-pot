"use client";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/store/useUIStore";

const Back = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>);
const Home = () => (<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l9-8 9 8" /><path d="M5 10v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9" /></svg>);
const Menu = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>);

interface Props {
  back?: boolean;
  home?: boolean;
  menu?: boolean;
  brand?: boolean;
}

export default function TopBar({ back, home, menu, brand }: Props) {
  const router = useRouter();
  const openDrawer = useUIStore((s) => s.openDrawer);
  return (
    <div className="topbar">
      {back && <button className="back focusable" aria-label="뒤로" onClick={() => router.back()}><Back /></button>}
      {brand && <div className="brandmark">오늘의 <b>사주</b></div>}
      <div className="spacer" />
      {home && <button className="menu focusable" aria-label="홈" onClick={() => router.push("/")}><Home /></button>}
      {menu && <button className="menu focusable" aria-label="메뉴" onClick={openDrawer}><Menu /></button>}
    </div>
  );
}
