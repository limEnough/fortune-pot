"use client";
import { useCallback, useEffect, useState } from "react";
import { toBlob, download, canShareFile, shareFile } from "@/lib/share/draw";

type Status = "idle" | "drawing" | "ready" | "error";

interface Props {
  /** 버튼 문구 */
  label: string;
  /** 시트 제목·부제 */
  title: string;
  hint: string;
  /** 저장될 파일 이름(확장자 포함) */
  filename: string;
  /** 눌렀을 때 카드를 그린다. 무거우니 열 때 한 번만 부른다 */
  render: () => Promise<HTMLCanvasElement>;
}

/**
 * 카드 이미지를 만들어 미리보기 바텀시트로 띄우고, 저장·공유를 제공한다.
 *
 * 저장 경로가 셋이다.
 *  1) 공유 시트(navigator.share) — 모바일에서 사진 앱·메신저로 바로 보낼 수 있다
 *  2) a[download] — 데스크톱과 안드로이드
 *  3) 미리보기 이미지 길게 누르기 — iOS 에서 1)이 막혀 있어도 늘 통한다
 * 그래서 다운로드만 두지 않고 미리보기를 반드시 보여준다.
 */
export default function SaveCardButton({
  label,
  title,
  hint,
  filename,
  render,
}: Props) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [url, setUrl] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);

  // 시트를 닫아도 objectURL 은 남으니 정리한다
  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [url]);

  const start = useCallback(async () => {
    setOpen(true);
    if (status === "ready" || status === "drawing") return;
    setStatus("drawing");
    try {
      // 캔버스 작업은 메인 스레드를 잡으므로, 시트가 실제로 그려진 뒤에 시작한다
      await new Promise((r) =>
        requestAnimationFrame(() => requestAnimationFrame(() => r(null))),
      );
      const canvas = await render();
      const b = await toBlob(canvas);
      setBlob(b);
      setUrl(URL.createObjectURL(b));
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, [render, status]);

  const close = () => setOpen(false);

  const onSave = () => {
    if (blob) download(blob, filename);
  };
  const onShare = () => {
    if (blob) void shareFile(blob, filename, title);
  };

  const shareable = blob ? canShareFile(blob, filename) : false;

  return (
    <>
      <button
        className="save-card focusable"
        onClick={start}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <path d="M7 10l5 5 5-5" />
          <path d="M12 15V3" />
        </svg>
        {label}
      </button>

      <div className={`sheet-scrim ${open ? "show" : ""}`} onClick={close} />
      <div
        className={`sheet card-sheet ${open ? "show" : ""}`}
        role="dialog"
        aria-label={title}
        aria-modal="true"
        aria-hidden={!open}
      >
        <div className="grip" />
        <button className="sheet-x focusable" onClick={close} aria-label="닫기">
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <h3>{title}</h3>
        <p>{hint}</p>

        <div
          className={`card-preview ${status === "ready" ? "" : "pending"}`}
          aria-busy={status === "drawing"}
        >
          {status === "ready" && url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={url} alt={`${title} 미리보기`} />
          ) : status === "error" ? (
            <div className="card-preview-msg">
              카드를 만들지 못했어요. 잠시 뒤 다시 시도해 주세요.
            </div>
          ) : (
            <span className="sk" />
          )}
        </div>

        <div className="card-actions">
          {shareable && (
            <button
              className="btn ghost block focusable"
              onClick={onShare}
              disabled={status !== "ready"}
            >
              공유하기
            </button>
          )}
          <button
            className="btn primary block focusable"
            onClick={onSave}
            disabled={status !== "ready"}
          >
            {status === "ready" ? "이미지 저장" : "카드를 그리는 중…"}
          </button>
        </div>
      </div>
    </>
  );
}
