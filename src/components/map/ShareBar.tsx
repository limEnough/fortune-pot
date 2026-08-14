"use client";
import { useState } from "react";

/**
 * 공유 링크 한 줄.
 *
 * 저장 카드(SaveCardButton)와 같은 이유로 경로를 둘 둔다 — 공유 시트가 있으면
 * 그쪽이 자연스럽고(카카오톡·메시지), 막혀 있거나 취소되면 클립보드로 떨어진다.
 * 그마저 안 되는 브라우저를 위해 주소 자체를 항상 보여주고 길게 눌러 복사할 수 있게 둔다.
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
    const data = {
      title: "포춘팟 귀인지도",
      text: `나는 ${ownerName}님에게 어떤 사람일까? 생일만 넣으면 바로 나와요.`,
      url,
    };
    if (navigator.share) {
      try {
        await navigator.share(data);
        return;
      } catch {
        // 사용자가 시트를 닫은 경우 — 복사로 떨어진다
      }
    }
    copy();
  };

  return (
    <div className="share-bar">
      <div className="share-url" title={url}>
        {url}
      </div>
      <div className="share-actions">
        <button className="btn ghost focusable" onClick={copy}>
          {copied ? "복사됐어요" : "링크 복사"}
        </button>
        <button className="btn primary focusable" onClick={share}>
          친구에게 보내기
        </button>
      </div>
    </div>
  );
}
