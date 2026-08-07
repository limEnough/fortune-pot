"use client";
import { useEffect, useMemo, useState } from "react";
import { useNav } from "@/hooks/useNav";
import { useSaju } from "@/hooks/useSaju";
import { useManse } from "@/hooks/useManse";
import TopBar from "@/components/TopBar";
import LoadingOverlay from "@/components/LoadingOverlay";
import FortuneCard from "@/components/FortuneCard";
import SajuInfoSheet from "@/components/SajuInfoSheet";
import { generateFortune } from "@/lib/saju/fortune";
import { computeSaju } from "@/lib/saju/calc";

export default function FortunePage() {
  const nav = useNav();
  const { saju, loading } = useSaju();
  const manseReady = useManse(); // 만세력을 받아오기 전에는 computeSaju 를 부를 수 없다
  const [infoOpen, setInfoOpen] = useState(false);

  useEffect(() => {
    if (!loading && !saju) nav.replace("/"); // 사주 없으면 홈으로
  }, [loading, saju, nav]);

  const fortune = useMemo(
    () =>
      saju && manseReady
        ? generateFortune(computeSaju(saju.birth, saju.hourIdx), saju.name)
        : null,
    [saju, manseReady],
  );

  if (loading || !saju || !fortune) {
    return (
      <section className="screen">
        <LoadingOverlay label="오늘의 운세를 준비하는 중" />
      </section>
    );
  }

  return (
    <section className="screen">
      <TopBar home menu />

      <div className="scroll">
        {/* 상단: 사주 정보 확인 트리거(탭하면 바텀시트) */}
        <button
          className="saju-info-pill focusable"
          onClick={() => setInfoOpen(true)}
          aria-label="내 사주 정보 보기"
          aria-expanded={infoOpen}
        >
          📋 내 사주 정보
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
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>

        <FortuneCard fortune={fortune} name={saju.name} />
      </div>

      <SajuInfoSheet
        saju={saju}
        open={infoOpen}
        onClose={() => setInfoOpen(false)}
      />
    </section>
  );
}
