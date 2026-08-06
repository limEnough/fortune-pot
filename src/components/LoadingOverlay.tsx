"use client";

interface Props {
  /** 스크린리더에 읽힐 설명 */
  label?: string;
  /** 스피너 아래 보여줄 문구 (없으면 스피너만) */
  text?: string;
}

/**
 * 화면 전체를 덮는 딤 + 가운데 스피너.
 * `.app`(position: relative) 기준으로 깔리므로 앱 프레임 안에만 표시됩니다.
 */
export default function LoadingOverlay({ label = "불러오는 중", text }: Props) {
  return (
    <div className="loading-overlay" role="status" aria-live="polite" aria-label={label}>
      <div className="loading-box">
        <div className="spinner" />
        {text && <p className="loading-text">{text}</p>}
      </div>
    </div>
  );
}
