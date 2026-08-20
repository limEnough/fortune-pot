"use client";
import { useEffect } from "react";
import type { SajuInput } from "@/types/saju";

/**
 * 메인 첫 진입에서 최근 조회 정보를 이어 쓸지 묻는 팝업.
 *
 * 예전엔 입력 폼 위 말풍선으로 제안했다. 그런데 그 말풍선은 이미 폼까지 들어간
 * 사람만 보게 되어서, 정작 "또 입력해야 하나" 하고 되돌아 나가는 사람에게는
 * 닿지 않았다. 그래서 다른 화면으로 떠나기 전인 **메인 한가운데**로 옮기고,
 * 배경을 덮어 이 결정을 먼저 하게 한다.
 */
export default function RecentSajuDialog({
  saju,
  onConfirm,
  onReset,
  onClose,
}: {
  saju: SajuInput;
  onConfirm: () => void;
  onReset: () => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="modal-scrim" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="recent-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="m-ic" aria-hidden="true">
          🔮
        </div>
        <h2 className="m-title" id="recent-title">
          최근 조회한 <b>{saju.name}</b>님으로
          <br />
          오늘의 운세를 확인해보시겠어요?
        </h2>
        <p className="m-sub">
          {saju.birth}
          {saju.gender && ` · ${saju.gender === "여" ? "여성" : "남성"}`}
          <br />
          운세·사주·귀인지도를 이 정보로 바로 볼 수 있어요.
        </p>
        <div className="m-actions">
          <button className="btn ghost focusable" onClick={onReset}>
            아니요, 새로 입력할게요
          </button>
          <button className="btn primary focusable" onClick={onConfirm}>
            네, 이 정보로 볼게요
          </button>
        </div>
      </div>
    </div>
  );
}
