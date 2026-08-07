"use client";
import { useNav } from "@/hooks/useNav";
import { useSaju } from "@/hooks/useSaju";
import ClayChar from "@/components/ClayChar";
import LoadingOverlay from "@/components/LoadingOverlay";
import TopBar from "@/components/TopBar";

export default function HomePage() {
  const nav = useNav();
  const { loading } = useSaju();
  // 캐시된 사주가 있어도 자동으로 운세 페이지로 이동하지 않습니다.
  // 최근 조회 정보의 재사용 제안은 입력 폼 상단 말풍선에서 처리해요.

  if (loading) {
    return (
      <section className="screen">
        <LoadingOverlay />
      </section>
    );
  }

  return (
    <section className="screen">
      <TopBar brand />
      <div className="scroll">
        <div className="hero">
          <ClayChar />
          <div className="eyebrow">매일 아침 열어보는 포춘쿠키</div>
          <h1 className="title">
            생년월일시로
            <br />
            <span className="pt">오늘의 운세를</span> 받아봐요!
          </h1>
          {/* <p className="sub">생년월일시로 풀어주는 다정한 길잡이</p> */}
        </div>
      </div>
      <div className="cta-wrap">
        {/* 어느 쪽을 골라도 입력 폼은 같고, 분석 후 도착지만 달라진다 */}
        <div className="cta-pick">먼저 보고 싶은 걸 골라주세요</div>
        <div className="cta-split">
          <button
            className="choice accent focusable"
            onClick={() => nav.push("/onboarding?next=fortune")}
          >
            <span className="ic" aria-hidden="true">
              🔮
            </span>
            <span className="k">오늘의 운세</span>
            <span className="d">
              하루 한 번
              <br />
              오늘의 흐름 보기
            </span>
          </button>
          <button
            className="choice focusable"
            onClick={() => nav.push("/onboarding?next=saju")}
          >
            <span className="ic" aria-hidden="true">
              📜
            </span>
            <span className="k">나의 사주</span>
            <span className="d">
              타고난 명식과
              <br />
              오행 풀이 보기
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
