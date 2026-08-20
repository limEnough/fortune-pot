"use client";
import { useEffect, useRef, useState } from "react";

/**
 * 공유 링크 한 줄 — 주소와 공유 버튼이 나란히 선다.
 *
 * 주소 자체를 늘 보여준다. 공유 시트도 클립보드도 막힌 브라우저에서 길게 눌러
 * 가져갈 마지막 길이기 때문이다(저장 카드가 미리보기를 반드시 띄우는 것과 같은 이유).
 * 그래서 주소 칸은 눌러서 복사되면서도 글자를 그대로 집을 수 있어야 한다 —
 * 버튼으로 바꾸면서 user-select 를 남겨둔 이유다.
 *
 * 버튼은 공유 시트(카카오톡·메시지)를 먼저 부르고, 그런 게 없는 브라우저에서만
 * 클립보드로 떨어진다. 사용자가 시트를 직접 닫은 경우에는 아무 일도 하지 않는다 —
 * 취소했는데 "복사됐어요" 가 뜨면 하지 않은 일을 했다고 말하는 셈이라서.
 *
 * 복사는 화면이 바뀌지 않는 동작이라 토스트가 유일한 응답이다. 그래서 실제로
 * 클립보드에 들어간 뒤에만 띄운다.
 */
export default function ShareBar({ id, ownerName }: { id: string; ownerName: string }) {
  const [toast, setToast] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const url = typeof window === "undefined" ? "" : `${window.location.origin}/map/${id}`;

  // 화면을 떠난 뒤 setState 가 도는 걸 막는다
  useEffect(() => () => clearTimeout(timer.current), []);

  const say = (message: string) => {
    setToast(message);
    // 연달아 누르면 앞선 타이머가 새 토스트를 일찍 지운다
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(""), 2000);
  };

  const copy = async () => {
    try {
      // 안전하지 않은 컨텍스트에서는 clipboard 자체가 없다 — 그 예외도 여기서 걸린다
      await navigator.clipboard.writeText(url);
      say("링크가 복사되었어요");
    } catch {
      window.prompt("아래 주소를 복사해 보내주세요", url);
    }
  };

  const share = async () => {
    if (!navigator.share) return copy();
    try {
      await navigator.share({
        title: "포춘팟 귀인지도",
        text: `나는 ${ownerName}님에게 어떤 사람일까? 생일만 넣으면 바로 나와요.`,
        url,
      });
    } catch {
      // 사용자가 시트를 닫았다 — 그대로 둔다
    }
  };

  return (
    <div className="share-bar">
      <button type="button" className="share-url focusable" title={url} onClick={copy}>
        {url}
      </button>
      <button type="button" className="btn primary share-copy focusable" onClick={share}>
        공유하기
      </button>

      {/*
        살아 있는 영역이라 껍데기는 늘 두고 안의 글자만 갈아끼운다.
        필요할 때 붙였다 떼면 스크린 리더가 바뀐 걸 놓치는 일이 있다.
      */}
      <p className={`toast ${toast ? "on" : ""}`} role="status" aria-live="polite">
        {toast}
      </p>
    </div>
  );
}
