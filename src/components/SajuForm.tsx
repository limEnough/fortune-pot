"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSaju } from "@/hooks/useSaju";
import { useGuestStore } from "@/store/useGuestStore";
import { HOUR_OPTIONS } from "@/lib/saju/constants";
import type { Gender } from "@/types/saju";

export default function SajuForm() {
  const router = useRouter();
  const { saju, save } = useSaju();
  const clearGuest = useGuestStore((s) => s.clear);

  // 항상 기본값으로 시작 — 최근 조회값은 상단 말풍선에서만 제안
  const [name, setName] = useState("");
  const [birth, setBirth] = useState("1996-06-16");
  const [hour, setHour] = useState<number>(6);
  const [gender, setGender] = useState<Gender>("여");
  const [busy, setBusy] = useState(false);
  const [bubbleDismissed, setBubbleDismissed] = useState(false);
  const [hourOpen, setHourOpen] = useState(false);
  const hourRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hourOpen) return;
    const onDown = (e: MouseEvent) => {
      if (hourRef.current && !hourRef.current.contains(e.target as Node)) {
        setHourOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setHourOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [hourOpen]);

  const showRecentBubble = !!saju && !bubbleDismissed;

  const useRecent = () => {
    router.push("/fortune");
  };
  const dropRecent = () => {
    clearGuest();
    setBubbleDismissed(true);
  };

  const submit = async () => {
    // 제출 직후 save()가 store를 갱신해 말풍선 조건이 재활성화되는 깜빡임 방지
    setBubbleDismissed(true);
    setBusy(true);
    try {
      await save({
        name: name.trim() || "게스트",
        birth,
        hourIdx: hour > 0 ? hour - 1 : null,
        gender,
      });
      router.push("/fortune");
    } catch (e) {
      alert("저장에 실패했어요. 잠시 후 다시 시도해 주세요.");
      setBusy(false);
    }
  };

  return (
    <div className="form">
      {showRecentBubble && saju && (
        <div className="recent-bubble" role="dialog" aria-label="최근 조회 사주 재사용">
          <p>
            최근 조회한 <b style={{ color: "var(--magic)" }}>{saju.name}</b>님으로
            오늘의 운세를 확인해보시겠어요?
          </p>
          <div className="bubble-actions">
            <button
              type="button"
              className="bubble-btn ghost focusable"
              onClick={dropRecent}
            >
              아니요
            </button>
            <button
              type="button"
              className="bubble-btn primary focusable"
              onClick={useRecent}
            >
              네
            </button>
          </div>
        </div>
      )}

      <div className="form-head">
        <h2>사주 정보 입력</h2>
        <span>정확한 풀이를 위해 태어난 순간을 알려주세요</span>
      </div>

      <label className="field"><span className="lab">이름</span>
        <input className="input focusable" value={name} placeholder="이름을 입력하세요" onChange={(e) => setName(e.target.value)} />
      </label>

      <label className="field"><span className="lab">생년월일</span>
        <input className="input focusable" type="date" value={birth} onChange={(e) => setBirth(e.target.value)} />
      </label>

      <div className="field">
        <span className="lab">태어난 시각</span>
        <div className="hour-select" ref={hourRef}>
          <button
            type="button"
            className="hour-trigger focusable"
            aria-haspopup="listbox"
            aria-expanded={hourOpen}
            onClick={() => setHourOpen((v) => !v)}
          >
            <span className="hour-value">{HOUR_OPTIONS[hour]}</span>
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
          </button>
          {hourOpen && (
            <ul className="hour-menu" role="listbox" aria-label="태어난 시각 선택">
              {HOUR_OPTIONS.map((opt, i) => (
                <li key={i} role="option" aria-selected={i === hour}>
                  <button
                    type="button"
                    className={`hour-opt focusable ${i === hour ? "selected" : ""}`}
                    onClick={() => {
                      setHour(i);
                      setHourOpen(false);
                    }}
                  >
                    {i === 0 ? (
                      <span className="hour-opt-label">{opt}</span>
                    ) : (
                      <>
                        <span className="hour-opt-label">{opt.split(" ")[0]}</span>
                        <span className="hour-opt-range">{opt.slice(opt.indexOf(" ") + 1)}</span>
                      </>
                    )}
                    {i === hour && (
                      <svg className="check" width="16" height="16" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" strokeWidth="2.6"
                        strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M5 12l5 5 9-11" />
                      </svg>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <span className="hint">모르면 비워두어도 풀이는 가능해요</span>
      </div>

      <label className="field"><span className="lab">성별</span>
        <div className="seg">
          <button type="button" className={`focusable ${gender === "여" ? "on" : ""}`} onClick={() => setGender("여")}>여성</button>
          <button type="button" className={`focusable ${gender === "남" ? "on" : ""}`} onClick={() => setGender("남")}>남성</button>
        </div>
      </label>

      <div className="spacer" />
      <button className="btn primary block focusable" style={{ marginTop: 6 }} disabled={busy} onClick={submit}>
        {busy ? "분석 중…" : "분석하기"}
      </button>
    </div>
  );
}
