"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSaju } from "@/hooks/useSaju";
import TopBar from "@/components/TopBar";
import ClayChar from "@/components/ClayChar";
import FortuneCard from "@/components/FortuneCard";
import SajuInfoSheet from "@/components/SajuInfoSheet";
import { generateFortune } from "@/lib/saju/fortune";

export default function FortunePage() {
  const router = useRouter();
  const { saju, loading } = useSaju();
  const [infoOpen, setInfoOpen] = useState(false);

  useEffect(() => {
    if (!loading && !saju) router.replace("/"); // 사주 없으면 홈으로
  }, [loading, saju, router]);

  const fortune = useMemo(() => (saju ? generateFortune(saju.name) : null), [saju]);

  if (loading || !saju || !fortune) {
    return <section className="screen"><div className="scroll"><div className="hero"><ClayChar variant="base" /></div></div></section>;
  }

  return (
    <section className="screen">
      <TopBar home menu />

      <div className="scroll">
        {/* 상단: 사주 정보 확인 트리거(탭하면 바텀시트) */}
        <button
          className="focusable"
          onClick={() => setInfoOpen(true)}
          aria-label="내 사주 정보 보기"
          style={{
            alignSelf: "center",
            margin: "0 0 12px",
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            padding: "8px 15px",
            borderRadius: 999,
            cursor: "pointer",
            border: "1px solid var(--line)",
            background: "rgba(255,255,255,.07)",
            color: "#efe6ff",
            fontFamily: "var(--body)",
            fontSize: 13,
            fontWeight: 700,
            backdropFilter: "blur(4px)",
          }}
        >
          📋 내 사주 정보
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}>
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>

        <FortuneCard fortune={fortune} name={saju.name} />
      </div>

      <SajuInfoSheet saju={saju} open={infoOpen} onClose={() => setInfoOpen(false)} />
    </section>
  );
}
