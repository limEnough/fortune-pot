"use client";
import { useEffect, useState } from "react";
import TopBar from "@/components/TopBar";
import ShareBar from "@/components/ShareBar";
import { RoomSkeletonScreen } from "@/components/Skeleton";
import { useMyRoom } from "@/hooks/useMyRoom";
import { useNav } from "@/hooks/useNav";
import { useSaju } from "@/hooks/useSaju";
import { ELEMENTS, type ElementKey } from "@/lib/game/elements";
import { recoveryCode } from "@/store/useRoomStore";
import GuestbookPanel from "./GuestbookPanel";
import RoomStage from "./RoomStage";
import SaveRoomButton from "./SaveRoomButton";

/*
 * 내 방.
 *
 * 방 마크업(배경 SVG)과 캐릭터 5종은 서버가 SSR 에 실어 보낸다. 어느 캐릭터인지는
 * **서버가 모른다** — 사주는 브라우저에만 있고 방 문서도 localStorage 의 id 로
 * 찾기 때문이다. 그래서 다섯 벌을 다 받아 두고 여기서 하나를 고른다. 어차피 방
 * 문서를 받아오는 왕복이 한 번 있으니, 캐릭터까지 따로 받으러 가지 않는 편이
 * 화면이 덜 튄다.
 */

interface Props {
  roomMarkup: string;
  characterMarkups: Record<ElementKey, string>;
}

export default function MyRoom({ roomMarkup, characterMarkups }: Props) {
  const nav = useNav();
  const { saju, loading } = useSaju();
  const { ready, hasRoom, id, token, room, error, reload } = useMyRoom();

  // 방을 막 만들고 넘어온 사람에게만 복구 코드를 세운다 — 볼 때마다 뜨면 잔소리가 된다
  const [showRecovery, setShowRecovery] = useState(!hasRoom);
  const [copied, setCopied] = useState(false);

  /*
   * 아직 방이 없으면 캐릭터를 빚는 화면으로 보낸다.
   *
   * 방을 만드는 일 자체는 저기서 끝난다. 여기서 버튼 하나로 만들 수도 있지만,
   * 그러면 다섯 중 하나가 왜 나인지를 말할 자리가 없어진다 — 그게 이 파트의
   * 알맹이라 처음 한 번은 반드시 거치게 한다.
   */
  useEffect(() => {
    if (!ready || loading) return;
    if (!saju) nav.replace("/infoinput?next=room");
    else if (!hasRoom) nav.replace("/my-room/intro");
  }, [ready, loading, saju, hasRoom, nav]);

  const copyCode = async () => {
    if (!id || !token) return;
    const code = recoveryCode(id, token);
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch {
      window.prompt("아래 복구 코드를 안전한 곳에 붙여넣어 두세요", code);
    }
  };

  // loading.tsx 와 같은 마크업이라야 라우트 전환에서 넘어올 때 화면이 튀지 않는다
  // (사주가 없거나 방이 없으면 위 effect 가 옮겨주는 동안 이 화면이 뜬다)
  if (!ready || loading || !saju || !hasRoom) return <RoomSkeletonScreen />;

  if (error && !room) {
    return (
      <section className="screen">
        <TopBar back home menu />
        <div className="scroll">
          <div className="room-card">
            <p className="room-err">{error}</p>
            <button className="btn ghost block focusable" onClick={reload}>
              다시 시도
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (!room) return <RoomSkeletonScreen />;

  const meta = ELEMENTS[room.element];
  const points = room.points ?? 0;

  return (
    <section className="screen">
      <TopBar back home menu />
      <div className="scroll">
        <div className="room-screen">
          <div className="room-head">
            <h1 className="room-title">
              <b>{room.nickname ?? saju.name}</b>님의 방
            </h1>
            <span className="el-badge" data-element={room.element}>
              {meta.ohaeng}({meta.hanja}) {meta.name}
            </span>
          </div>

          {/* 방명록 창은 무대 바깥에 붙는다 — 무대가 overflow 를 자르기 때문 */}
          <div className="room-frame">
            <RoomStage
              element={room.element}
              roomMarkup={roomMarkup}
              characterMarkup={characterMarkups[room.element]}
              decor={room.decor}
              hint="캐릭터를 눌러보세요"
              overlay={
                <span className="point-badge">
                  <span className="ic" aria-hidden>
                    ✨
                  </span>
                  {points.toLocaleString()}P
                </span>
              }
            />
            {id && (
              <GuestbookPanel publicId={id} ownerName={room.nickname ?? saju.name} />
            )}
          </div>

          {/*
            출석은 운세 화면에서만 찍힌다. 방에 들어온 것만으로 포인트를 주면
            운세를 볼 이유가 사라지고, 매일 돌아올 이유를 만들려던 게 흐려진다.
          */}
          {room.claimedToday === false && (
            <div className="reward-bar">
              <span className="ic" aria-hidden>
                🔮
              </span>
              <div className="body">
                <div className="k">오늘의 운세가 아직이에요</div>
                <div className="v">운세를 보면 포인트가 들어와요. 하루 한 번이에요.</div>
              </div>
              <button className="go focusable" onClick={() => nav.push("/fortune")}>
                보러가기
              </button>
            </div>
          )}

          <div className="room-actions">
            <button
              className="btn ghost focusable"
              onClick={() => nav.push("/my-room/decorate")}
            >
              🎨 꾸미기
            </button>
            {/* 친구에게 어떻게 보이는지 — 방명록은 위 쪽지 버튼에서 바로 열린다 */}
            <button
              className="btn ghost focusable"
              onClick={() => nav.push(`/room/${id}`)}
            >
              👀 손님 눈으로 보기
            </button>
          </div>

          <SaveRoomButton
            element={room.element}
            roomMarkup={roomMarkup}
            characterMarkup={characterMarkups[room.element]}
            decor={room.decor}
            nickname={room.nickname}
            shareUrl={
              typeof window === "undefined" ? undefined : `${window.location.host}/room/${id}`
            }
          />

          {showRecovery && id && token && (
            <div className="recovery">
              <h3>🔑 복구 코드를 챙겨두세요</h3>
              <p>
                이 방은 <b>이 브라우저에만</b> 열쇠가 있어요. 기록을 지우거나 기기를
                바꾸면 모아둔 포인트와 산 아이템을 되찾을 수 없어요. 아래 코드를
                메모해두면 다른 기기에서도 이 방을 열 수 있어요.
              </p>
              <button className="recovery-code focusable" onClick={copyCode}>
                {recoveryCode(id, token)}
              </button>
              <div className="room-actions">
                <button className="btn ghost focusable" onClick={copyCode}>
                  {copied ? "복사했어요" : "복사하기"}
                </button>
                <button
                  className="btn ghost focusable"
                  onClick={() => setShowRecovery(false)}
                >
                  챙겼어요
                </button>
              </div>
            </div>
          )}

          <div className="room-card">
            <h2>🔗 내 방 자랑하기</h2>
            <p>
              링크를 받은 사람은 로그인 없이 방을 구경하고 <b>방명록</b>을 남길 수 있어요.
              꾸미기는 나만 할 수 있어요.
            </p>
            {id && (
              <ShareBar
                path={`/room/${id}`}
                title="포춘팟 내 방"
                text={`${room.nickname ?? saju.name}님의 사주 캐릭터 방을 구경해보세요.`}
              />
            )}
          </div>

          <p className="room-note">
            포인트는 하루 한 번, 오늘의 운세를 볼 때 들어와요.
            <br />
            같은 날에는 몇 번을 열어도 금액이 바뀌지 않아요.
          </p>
        </div>
      </div>
    </section>
  );
}
