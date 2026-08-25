"use client";
import { useEffect, useState } from "react";
import ShareBar from "@/components/ShareBar";
import { useNav } from "@/hooks/useNav";
import { useRoomStore } from "@/store/useRoomStore";

/**
 * 남의 방 아래에 서는 줄.
 *
 * 같은 화면이 세 사람에게 다르게 보여야 한다.
 *   주인       — 꾸미러 가는 길과 공유 링크
 *   방이 있는 손님 — 내 방으로 돌아가는 길
 *   처음 온 손님   — 내 방을 만드는 길 (이 링크의 진짜 목적)
 *
 * 판단 근거가 localStorage 라 서버는 알 수 없다. 하이드레이션 전에는 아무것도
 * 그리지 않는다 — 셋 중 하나를 찍어 두면 붙는 순간 글자가 바뀌어 더 어수선하다.
 */
export default function RoomVisitCta({
  publicId,
  ownerName,
}: {
  publicId: string;
  ownerName: string;
}) {
  const nav = useNav();
  const myRoomId = useRoomStore((s) => s.id);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  if (myRoomId === publicId) {
    return (
      <div className="room-card">
        <h2>🏠 내 방이에요</h2>
        <p>친구들에게 보이는 모습이 이래요. 이 링크를 그대로 보내면 돼요.</p>
        <ShareBar
          path={`/room/${publicId}`}
          title="포춘팟 내 방"
          text={`${ownerName}님의 사주 캐릭터 방을 구경해보세요.`}
        />
        <button
          className="btn primary block focusable"
          onClick={() => nav.push("/my-room/decorate")}
        >
          🎨 꾸미러 가기
        </button>
      </div>
    );
  }

  return (
    <div className="room-card">
      <h2>🔮 내 캐릭터는 누구일까?</h2>
      <p>
        생년월일을 넣으면 사주의 <b>일간</b>이 오행 캐릭터 하나를 정해줘요.
        매일 운세를 볼 때마다 포인트가 쌓이고, 그 포인트로 방을 꾸며요.
      </p>
      {/* 사주가 이미 있으면 /my-room 이 캐릭터 화면으로 넘겨준다 — 여기서 가르지 않는다 */}
      <button
        className="btn primary block focusable"
        onClick={() => nav.push(myRoomId ? "/my-room" : "/my-room/intro")}
      >
        {myRoomId ? "내 방으로 가기" : "내 캐릭터 만나기"}
      </button>
    </div>
  );
}
