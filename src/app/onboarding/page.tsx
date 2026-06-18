"use client";
import TopBar from "@/components/TopBar";
import SajuForm from "@/components/SajuForm";

export default function OnboardingPage() {
  return (
    <section className="screen">
      <TopBar back home />
      <div className="scroll">
        <SajuForm />
      </div>
    </section>
  );
}
