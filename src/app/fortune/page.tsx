"use client";
import { useEffect, useMemo, useState } from "react";
import { useNav } from "@/hooks/useNav";
import { useSaju } from "@/hooks/useSaju";
import { useManse } from "@/hooks/useManse";
import TopBar from "@/components/TopBar";
import FortuneCard from "@/components/FortuneCard";
import { FortuneSkeletonScreen } from "@/components/Skeleton";
import SajuInfoSheet from "@/components/SajuInfoSheet";
import RewardBanner from "@/components/game/RewardBanner";
import { generateFortune } from "@/lib/saju/fortune";
import { computeSaju } from "@/lib/saju/calc";
import { isComplete } from "@/types/saju";

export default function FortunePage() {
  const nav = useNav();
  const { saju, loading } = useSaju();
  const manseReady = useManse(); // 만세력을 받아오기 전에는 computeSaju 를 부를 수 없다
  const [infoOpen, setInfoOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!saju) return nav.replace("/"); // 사주 없으면 홈으로
    // 귀인지도에서 넘어온 사람은 성별이 비어 있다 — 그 칸만 받고 돌아온다
    if (!isComplete(saju)) nav.replace("/infoinput?next=fortune");
  }, [loading, saju, nav]);

  const fortune = useMemo(
    () =>
      saju && manseReady
        ? generateFortune(computeSaju(saju.birth, saju.hourIdx), saju.name)
        : null,
    [saju, manseReady],
  );

  // 전환 중 loading.tsx 가 띄우던 것과 같은 화면 — 이어지듯 넘어간다
  if (loading || !isComplete(saju) || !fortune) return <FortuneSkeletonScreen />;

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

        {/*
          운세를 본 것이 곧 출석이다. 카드 아래에 결과 한 줄만 붙여
          운세를 보러 온 시선을 포인트가 가로채지 않게 한다.
        */}
        <RewardBanner />
      </div>

      <SajuInfoSheet
        saju={saju}
        open={infoOpen}
        onClose={() => setInfoOpen(false)}
      />
    </section>
  );
}
