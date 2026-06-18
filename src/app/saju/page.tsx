"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSaju } from "@/hooks/useSaju";
import TopBar from "@/components/TopBar";
import ClayChar from "@/components/ClayChar";
import SajuChart from "@/components/SajuChart";

export default function SajuPage() {
  const router = useRouter();
  const { saju, loading } = useSaju();

  useEffect(() => {
    if (!loading && !saju) router.replace("/");
  }, [loading, saju, router]);

  if (loading || !saju) {
    return <section className="screen"><div className="scroll"><div className="hero"><ClayChar variant="love" /></div></div></section>;
  }

  return (
    <section className="screen">
      <TopBar back home />
      <div className="scroll">
        <SajuChart saju={saju} />
      </div>
    </section>
  );
}
