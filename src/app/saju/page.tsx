"use client";
import { useEffect } from "react";
import { useNav } from "@/hooks/useNav";
import { useSaju } from "@/hooks/useSaju";
import { useManse } from "@/hooks/useManse";
import TopBar from "@/components/TopBar";
import LoadingOverlay from "@/components/LoadingOverlay";
import SajuChart from "@/components/SajuChart";

export default function SajuPage() {
  const nav = useNav();
  const { saju, loading } = useSaju();
  const manseReady = useManse(); // SajuChart 가 computeSaju 를 렌더 중에 부른다

  useEffect(() => {
    if (!loading && !saju) nav.replace("/");
  }, [loading, saju, nav]);

  if (loading || !saju || !manseReady) {
    return (
      <section className="screen">
        <LoadingOverlay label="사주 정보를 불러오는 중" />
      </section>
    );
  }

  return (
    <section className="screen">
      <TopBar back home menu />
      <div className="scroll">
        {/* 운세 화면의 '내 사주 정보' 칩과 짝을 이루는 반대 방향 이동 */}
        <button
          className="nav-pill focusable"
          onClick={() => nav.push("/fortune")}
          aria-label="오늘의 운세 확인하기"
        >
          🔮 오늘의 운세 확인하기
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ opacity: 0.7 }}
          >
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>

        <SajuChart saju={saju} />
      </div>
    </section>
  );
}
