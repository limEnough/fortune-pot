"use client";
import { useEffect, useRef, useState } from "react";
import { HOUR_OPTIONS } from "@/lib/saju/constants";

const Chev = () => (
  <svg
    className="chev"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M6 9l6 6 6-6" />
  </svg>
);
const Check = () => (
  <svg
    className="check"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M5 12l5 5 9-11" />
  </svg>
);

interface Props {
  /**
   * number    — 실제로 고른 시간(0=자시 … 11=해시)
   * null      — '모르겠어요'를 직접 고름
   * undefined — 아직 아무것도 안 골랐다
   */
  value: number | null | undefined;
  onChange: (value: number | null | undefined) => void;
  /** 체크박스 아래 안내 문구 — 쓰이는 화면마다 다르다 */
  hint: React.ReactNode;
}

/**
 * 태어난 시간 고르기 — 드롭다운 + '모르겠어요' 체크박스.
 *
 * 기본은 늘 빈 채다. 임의의 시간이나 '모르겠어요'를 미리 짚어두지 않는다 —
 * 그러면 고르지 않고 그냥 제출해버릴 수 있어서다. 부모가 이미 답을 알고
 * 있다면(전에 다른 화면에서 답했거나 불러온 값이 있으면) value 로 그 값을
 * 넘겨 채운다.
 *
 * '모르겠어요'는 목록 항목이 아니라 별도 체크박스다 — 체크하면 드롭다운이
 * 잠기고, 풀면 임의의 시간으로 튀지 않고 다시 빈 채로 돌아간다.
 */
export default function HourPicker({ value, onChange, hint }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unknown = value === null; // '모르겠어요'를 직접 고른 것
  const unpicked = value === undefined; // 아직 아무것도 안 골랐다

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="join-hour">
      <div className="hour-select" ref={ref}>
        <button
          type="button"
          className="hour-trigger focusable"
          aria-haspopup="listbox"
          aria-expanded={open}
          disabled={unknown}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="hour-value">
            {unknown || unpicked ? "태어난 시간" : HOUR_OPTIONS[value + 1]}
          </span>
          <Chev />
        </button>
        {open && (
          <ul className="hour-menu" role="listbox" aria-label="태어난 시간 선택">
            {HOUR_OPTIONS.slice(1).map((opt, i) => (
              <li key={i} role="option" aria-selected={i === value}>
                <button
                  type="button"
                  className={`hour-opt focusable ${i === value ? "selected" : ""}`}
                  onClick={() => {
                    onChange(i);
                    setOpen(false);
                  }}
                >
                  <span className="hour-opt-label">{opt.split(" ")[0]}</span>
                  <span className="hour-opt-range">{opt.slice(opt.indexOf(" ") + 1)}</span>
                  {i === value && <Check />}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <label className="check focusable">
        <input
          type="checkbox"
          checked={unknown}
          onChange={(e) => {
            // 체크를 풀면 빈 채로 되돌린다 — 임의의 시간을 대신 짚어주지 않는다
            onChange(e.target.checked ? null : undefined);
            if (e.target.checked) setOpen(false); // 잠그는 순간 열려 있던 목록도 닫는다
          }}
        />
        <span className="box" aria-hidden="true" />
        모르겠어요
      </label>
      <span className="hint">{hint}</span>
    </div>
  );
}
