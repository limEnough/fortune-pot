"use client";
import { useNav } from "@/hooks/useNav";
import { useSaju } from "@/hooks/useSaju";
import { useGuestStore } from "@/store/useGuestStore";
import { useSessionStore } from "@/store/useSessionStore";
import { useMapStore } from "@/store/useMapStore";
import ClayChar from "@/components/ClayChar";
import TopBar from "@/components/TopBar";
import RecentSajuDialog from "@/components/RecentSajuDialog";
import { isComplete } from "@/types/saju";

export default function HomePage() {
  const nav = useNav();
  const { saju, loading } = useSaju();
  const clearGuest = useGuestStore((s) => s.clear);
  const forgetMap = useMapStore((s) => s.clear);
  const { confirmed, asked, confirm, markAsked, reset } = useSessionStore();

  /*
   * 저장된 사주가 있으면 **다른 화면으로 떠나기 전에** 한 번 묻는다.
   * 확인하면 이번 세션 내내 이 정보로 운세·사주·귀인지도를 본다.
   *
   * useSaju().loading 은 곧 하이드레이션 대기다. 세션 저장소도 그 전에는 읽으면
   * 안 되므로(서버 렌더에는 없다) 같은 신호에 묶어 둔다.
   */
  const askNow = !loading && !!saju && !asked;

  const startOver = () => {
    clearGuest();
    forgetMap(); // 지도 주소록도 함께 — 남의 정보로 만든 지도를 붙들고 있지 않게
    reset();
  };

  /*
   * 확인했으면 입력을 건너뛰고 바로 그 화면으로 간다.
   * 다만 귀인지도만 하고 온 사람은 성별이 비어 있다 — 두 화면이 표시에 쓰므로
   * 입력 폼을 한 번 거친다. 폼은 나머지 칸을 채운 채로 뜬다.
   */
  const go = (dest: "fortune" | "saju") =>
    nav.push(
      confirmed && isComplete(saju) ? `/${dest}` : `/infoinput?next=${dest}`,
    );

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
        </div>
      </div>

      <div className="cta-wrap">
        {!loading && confirmed && saju ? (
          <div className="using">
            <p>
              <b>{saju.name}</b>님 정보로 이용중이에요.
              <br />새 정보로 시작하려면 초기화 버튼을 눌러주세요.
            </p>
            <button className="using-reset focusable" onClick={startOver}>
              초기화
            </button>
          </div>
        ) : (
          <div className="cta-pick">먼저 보고 싶은 걸 골라주세요</div>
        )}

        {/*
          네 칸이 같은 생김새다. 예전엔 운세·사주가 한 줄, 귀인지도·내 방이 각각
          가로로 눕는 줄이었는데 — 성격이 다르다는 걸 모양으로 말하려던 것이지만,
          넷이 되자 같은 층위의 메뉴가 세 가지 모양으로 갈려 오히려 어수선했다.
        */}
        <div className="cta-split">
          <button className="choice focusable" onClick={() => go("fortune")}>
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
          <button className="choice focusable" onClick={() => go("saju")}>
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
          <button className="choice focusable" onClick={() => nav.push("/map")}>
            <span className="ic" aria-hidden="true">
              🌟
            </span>
            <span className="k">내 귀인지도</span>
            <span className="d">
              생일만 넣으면
              <br />
              친구와의 케미가 별자리로
            </span>
          </button>
          {/* 방이 없으면 캐릭터를 빚는 화면으로, 있으면 방으로 — /my-room 이 가른다 */}
          <button className="choice focusable" onClick={() => nav.push("/my-room")}>
            <span className="ic" aria-hidden="true">
              🏠
            </span>
            <span className="k">내 방</span>
            <span className="d">
              사주 캐릭터와 살며
              <br />
              매일 출석하면 포인트가
            </span>
          </button>
        </div>
      </div>

      {askNow && saju && (
        <RecentSajuDialog
          saju={saju}
          onConfirm={confirm}
          onReset={startOver}
          onClose={markAsked}
        />
      )}
    </section>
  );
}
