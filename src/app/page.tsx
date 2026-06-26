"use client";
import { useRouter } from "next/navigation";
import { useSaju } from "@/hooks/useSaju";
import ClayChar from "@/components/ClayChar";
import TopBar from "@/components/TopBar";
// 로그인 비활성화(비회원 전용)
// import { useState } from "react";
// import LoginSheet from "@/components/LoginSheet";

export default function HomePage() {
  const router = useRouter();
  const { loading } = useSaju();
  // const [sheet, setSheet] = useState(false);
  // 캐시된 사주가 있어도 자동으로 운세 페이지로 이동하지 않습니다.
  // 최근 조회 정보의 재사용 제안은 입력 폼 상단 말풍선에서 처리해요.

  if (loading) {
    return <section className="screen"><div className="scroll"><div className="hero"><ClayChar variant="dream" /></div></div></section>;
  }

  return (
    <section className="screen">
      <TopBar brand />
      <div className="scroll">
        <div className="hero">
          <ClayChar />
          <div className="eyebrow">매일 아침 도착하는 나의 사주</div>
          <h1 className="title">사주로 보는<br /><span className="pt">오늘의 운세</span>를 받아보세요</h1>
          <p className="sub">생년월일시로 풀어주는<br />하루 한 번의 다정한 길잡이</p>
        </div>
      </div>
      <div className="cta-wrap">
        <button className="btn primary block focusable" onClick={() => router.push("/onboarding")}>시작하기</button>
        {/* 로그인 기능은 현재 비활성화되어 있습니다(비회원 전용)
        <button className="btn primary block focusable" onClick={() => setSheet(true)}>로그인하기</button>
        <button className="link-btn focusable" onClick={() => router.push("/onboarding")}>로그인 없이 이용할래요</button>
        <LoginSheet open={sheet} onClose={() => setSheet(false)} /> */}
      </div>
    </section>
  );
}
