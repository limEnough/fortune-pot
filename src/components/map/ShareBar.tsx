"use client";
import { useState } from "react";

/**
 * 공유 링크 한 줄 — 주소와 공유 버튼이 나란히 선다.
 *
 * 주소 자체를 늘 보여준다. 공유 시트도 클립보드도 막힌 브라우저에서 길게 눌러
 * 가져갈 마지막 길이기 때문이다(저장 카드가 미리보기를 반드시 띄우는 것과 같은 이유).
 *
 * 버튼은 공유 시트(카카오톡·메시지)를 먼저 부르고, 그런 게 없는 브라우저에서만
 * 클립보드로 떨어진다. 사용자가 시트를 직접 닫은 경우에는 아무 일도 하지 않는다 —
 * 취소했는데 "복사됐어요" 가 뜨면 하지 않은 일을 했다고 말하는 셈이라서.
 */
export default function ShareBar({ id, ownerName }: { id: string; ownerName: string }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window === "undefined" ? "" : `${window.location.origin}/map/${id}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
      <div className="share-url" title={url}>
        {url}
      </div>
      <button className="btn primary share-copy focusable" onClick={share}>
        {copied ? "복사됐어요" : "공유하기"}
      </button>
    </div>
  );
}
