"use client";
import { Suspense } from "react";
import TopBar from "@/components/TopBar";
import SajuForm from "@/components/SajuForm";

/**
 * 내 정보 수정 화면.
 *
 * 버튼은 **저장까지만** 한다. 저장하면 고치기 전에 있던 자리(`?from=`)로
 * 돌아간다 — 메뉴에서 들어온 사람은 화면을 옮기려던 게 아니라 값을 고치려던
 * 것이기 때문이다. 최근 조회 말풍선도 띄우지 않는다.
 */
export default function InfoPage() {
  return (
    <section className="screen">
      <TopBar back home menu />
      <div className="scroll">
        {/* SajuForm이 useSearchParams(?from=)로 돌아갈 자리를 읽는다 */}
        <Suspense fallback={null}>
          <SajuForm mode="edit" />
        </Suspense>
      </div>
    </section>
  );
}
