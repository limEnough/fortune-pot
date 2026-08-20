"use client";
import { useState } from "react";

/**
 * 공유 링크 한 줄 — 주소와 복사 버튼이 나란히 선다.
 *
 * 주소 자체를 늘 보여준다. 클립보드가 막힌 브라우저에서도 길게 눌러 가져갈 수
 * 있어야 하기 때문이다(복사가 실패하면 prompt 로 한 번 더 내민다).
 *
 * 공유 시트(navigator.share)로 카카오톡·메시지에 바로 던지는 버튼은 잠시 내렸다.
 * 되살릴 때를 위해 아래 주석에 그대로 둔다 — ownerName 도 그 문구에만 쓰인다.
 */
export default function ShareBar({ id }: { id: string; ownerName?: string }) {
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

  // const share = async () => {
  //   const data = {
  //     title: "포춘팟 귀인지도",
  //     text: `나는 ${ownerName}님에게 어떤 사람일까? 생일만 넣으면 바로 나와요.`,
  //     url,
  //   };
  //   if (navigator.share) {
  //     try {
  //       await navigator.share(data);
  //       return;
  //     } catch {
  //       // 사용자가 시트를 닫은 경우 — 복사로 떨어진다
  //     }
  //   }
  //   copy();
  // };

  return (
    <div className="share-bar">
      <div className="share-url" title={url}>
        {url}
      </div>
      <button className="btn primary share-copy focusable" onClick={copy}>
        {copied ? "복사됐어요" : "링크 복사"}
      </button>
      {/* <button className="btn primary focusable" onClick={share}>친구에게 보내기</button> */}
    </div>
  );
}
