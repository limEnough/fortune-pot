"use client";
import { Suspense } from "react";
import TopBar from "@/components/TopBar";
import SajuForm from "@/components/SajuForm";

export default function OnboardingPage() {
  return (
    <section className="screen">
      <TopBar back home />
      <div className="scroll">
        {/* SajuForm이 useSearchParams(?next=)로 도착지를 읽어서 Suspense가 필요하다 */}
        <Suspense fallback={null}>
          <SajuForm />
        </Suspense>
      </div>
    </section>
  );
}
