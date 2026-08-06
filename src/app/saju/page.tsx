"use client";
import { useEffect } from "react";
import { useNav } from "@/hooks/useNav";
import { useSaju } from "@/hooks/useSaju";
import TopBar from "@/components/TopBar";
import LoadingOverlay from "@/components/LoadingOverlay";
import SajuChart from "@/components/SajuChart";

export default function SajuPage() {
  const nav = useNav();
  const { saju, loading } = useSaju();

  useEffect(() => {
    if (!loading && !saju) nav.replace("/");
  }, [loading, saju, nav]);

  if (loading || !saju) {
    return <section className="screen"><LoadingOverlay label="사주 정보를 불러오는 중" /></section>;
  }

  return (
    <section className="screen">
      <TopBar back home menu />
      <div className="scroll">
        <SajuChart saju={saju} />
      </div>
    </section>
  );
}
