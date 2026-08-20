"use client";
import { Suspense } from "react";
import TopBar from "@/components/TopBar";
import SajuForm from "@/components/SajuForm";

/**
 * 운세·사주를 보러 가는 길목의 입력 화면.
 *
 * 버튼을 누르면 저장하고 **고른 화면으로 바로 넘어간다**(`?next=fortune|saju`).
 * 최근 조회 기록이 있으면 맨 위 말풍선이 그대로 쓰기를 제안한다 — 여기서는
 * 그게 지름길이지만, 정보를 고치러 온 `/info` 에서는 하려던 일을 막는 제안이라
 * 화면을 나눴다.
 */
export default function InfoInputPage() {
  return (
    <section className="screen">
      <TopBar back home menu />
      <div className="scroll">
        {/* SajuForm이 useSearchParams(?next=)로 도착지를 읽어서 Suspense가 필요하다 */}
        <Suspense fallback={null}>
          <SajuForm mode="start" />
        </Suspense>
      </div>
    </section>
  );
}
