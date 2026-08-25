"use client";
import { useEffect, useRef, useState } from "react";
import { useNav } from "@/hooks/useNav";
import { apiPost } from "@/lib/http";
import type { RewardResult } from "@/lib/game/types";
import { ownerHeaders, useRoomStore } from "@/store/useRoomStore";

/*
 * 오늘의 운세를 본 것이 곧 출석이다.
 *
 * 운세를 다 그린 뒤에 조용히 한 번 지급을 요청하고, 결과만 아래에 한 줄로 알린다.
 * 모달로 가로막지 않는 건 운세를 보러 온 사람의 시선을 포인트가 채가면 안 되기
 * 때문이다.
 *
 * 지급은 서버가 (방 id + 서울 날짜) 로 이미 정해 둔 금액을 하루 한 번만 넣는다.
 * 그래서 이 요청이 몇 번 나가든(개발 모드의 이중 호출, 뒤로 갔다 오기) 결과가
 * 달라지지 않는다 — 낙관적 표시나 중복 방지 장치를 따로 두지 않은 이유다.
 */
export default function RewardBanner() {
  const nav = useNav();
  const id = useRoomStore((s) => s.id);
  const token = useRoomStore((s) => s.token);

  const [mounted, setMounted] = useState(false);
  const [result, setResult] = useState<RewardResult | null>(null);
  const asked = useRef(false);

  useEffect(() => setMounted(true), []); // localStorage 하이드레이션 대기

  useEffect(() => {
    if (!mounted || !id || asked.current) return;
    asked.current = true;
    apiPost<RewardResult>(`/api/game/room/${id}/reward`, {}, { headers: ownerHeaders(token) })
      .then(setResult)
      // 실패해도 운세 화면은 멀쩡해야 한다. 내일 다시 열면 그때 들어온다
      .catch(() => undefined);
  }, [mounted, id, token]);

  if (!mounted) return null;

  /* 아직 방이 없다 — 여기서 처음 알린다 */
  if (!id) {
    return (
      <div className="reward-bar">
        <span className="ic" aria-hidden>
          🏠
        </span>
        <div className="body">
          <div className="k">내 방을 만들면 포인트가 쌓여요</div>
          <div className="v">
            사주 일간으로 정해진 캐릭터가 방에 살아요. 운세를 볼 때마다 포인트를 받아
            방을 꾸밀 수 있어요.
          </div>
        </div>
        <button className="go focusable" onClick={() => nav.push("/my-room")}>
          만들기
        </button>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="reward-bar">
      <span className="ic" aria-hidden>
        {result.granted ? "🎁" : "✨"}
      </span>
      <div className="body">
        <div className="k">
          {result.granted ? (
            <>
              출석 완료! <b>+{result.amount}P</b>
            </>
          ) : (
            <>
              오늘 몫은 받았어요 · <b>{result.points.toLocaleString()}P</b>
            </>
          )}
        </div>
        <div className="v">
          {result.granted
            ? `모은 포인트는 ${result.points.toLocaleString()}P 예요. 방을 꾸미러 가볼까요?`
            : "포인트는 내일 다시 들어와요."}
        </div>
      </div>
      <button className="go focusable" onClick={() => nav.push("/my-room")}>
        내 방
      </button>
    </div>
  );
}
