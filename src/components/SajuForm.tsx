"use client";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSaju } from "@/hooks/useSaju";
import { useNav } from "@/hooks/useNav";
import { useGuestStore } from "@/store/useGuestStore";
import { useSessionStore } from "@/store/useSessionStore";
import { HOUR_OPTIONS } from "@/lib/saju/constants";
import type { Gender } from "@/types/saju";

export default function SajuForm() {
  const nav = useNav();
  const searchParams = useSearchParams();
  const { saju, save } = useSaju();
  const clearGuest = useGuestStore((s) => s.clear);
  // 여기까지 와서 정보를 확정한 사람에게 메인에서 또 물을 이유가 없다
  const { confirm, reset: resetSession } = useSessionStore();

  const [name, setName] = useState("");
  const [birth, setBirth] = useState("1996-06-16");
  const [hour, setHour] = useState<number>(6);
  const [gender, setGender] = useState<Gender>("여");
  const [busy, setBusy] = useState(false);
  const [bubbleDismissed, setBubbleDismissed] = useState(false);
  const [hourOpen, setHourOpen] = useState(false);
  const [filled, setFilled] = useState(false);
  const hourRef = useRef<HTMLDivElement>(null);

  /*
   * 저장된 값이 있으면 폼을 그 값으로 채운다.
   *
   * 예전엔 늘 기본값으로 시작하고 재사용은 말풍선으로만 제안했다. 그런데 이제
   * 귀인지도에서 이름·생일·시각까지 받고 오는 길이 생겼다. 그 사람에게 필요한 건
   * **성별 한 칸**이지 처음부터 다시 넣는 일이 아니다.
   * 하이드레이션 뒤에 한 번만 채우고, 이후 타이핑은 덮어쓰지 않는다.
   */
  useEffect(() => {
    if (filled || !saju) return;
    setName(saju.name);
    setBirth(saju.birth);
    setHour(saju.hourIdx === null ? 0 : saju.hourIdx + 1);
    if (saju.gender) setGender(saju.gender);
    setFilled(true);
  }, [saju, filled]);

  /*
   * 지도만 하고 온 사람 — 이름·생일은 찼고 성별이 비어 있다.
   * 태어난 시각도 안 넣었다면(지도에선 '모르겠어요' 가 기본) 여기서 한 번 더
   * 묻는다. 사주 풀이는 시주가 있고 없고가 크게 다르므로, 그냥 넘기지 않고
   * 고를 기회를 준다 — 그래도 모르면 '모르겠어요' 그대로 두면 된다.
   */
  const fromMap = !!saju && saju.gender === null;
  const needHour = fromMap && saju.hourIdx === null;

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

  // 홈에서 고른 도착지(?next=saju|fortune) — 없으면 오늘의 운세로
  const wantsSaju = searchParams.get("next") === "saju";
  const dest = wantsSaju ? "/saju" : "/fortune";
  const destLabel = wantsSaju ? "사주 풀이" : "오늘의 운세";

  // 빠진 칸을 채우러 온 사람에게 "이 정보로 볼까요" 를 다시 묻지 않는다
  const showRecentBubble = !!saju && !fromMap && !bubbleDismissed;

  const useRecent = () => {
    confirm();
    nav.push(dest);
  };
  const dropRecent = () => {
    clearGuest();
    resetSession();
    setBubbleDismissed(true);
  };

  const submit = async () => {
    // 제출 직후 save()가 store를 갱신해 말풍선 조건이 재활성화되는 깜빡임 방지
    setBubbleDismissed(true);
    // 저장 → 전환 사이는 버튼의 '분석 중…' 상태가 덮는다.
    // 도착 화면은 자기 스켈레톤을 띄우므로 여기서 전역 로딩을 켤 필요가 없다.
    setBusy(true);
    try {
      await save({
        name: name.trim() || "게스트",
        birth,
        hourIdx: hour > 0 ? hour - 1 : null,
        gender,
      });
      confirm();
      nav.push(dest);
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
            {destLabel}를 확인해보시겠어요?
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
        <span>
          {!fromMap
            ? "정확한 풀이를 위해 태어난 순간을 알려주세요"
            : needHour
              ? "귀인지도에 넣은 정보를 가져왔어요. 성별과 태어난 시각만 확인해 주세요"
              : "귀인지도에 넣은 정보를 가져왔어요. 성별만 골라주세요"}
        </span>
      </div>

      <label className="field"><span className="lab">이름</span>
        <input className="input focusable" value={name} placeholder="이름을 입력하세요" onChange={(e) => setName(e.target.value)} />
      </label>

      <label className="field"><span className="lab">생년월일</span>
        <input className="input focusable" type="date" value={birth} onChange={(e) => setBirth(e.target.value)} />
      </label>

      <div className="field">
        <span className="lab">
          태어난 시각
          {needHour && <em className="need">확인 필요</em>}
        </span>
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

      <label className="field">
        <span className="lab">
          성별
          {fromMap && <em className="need">확인 필요</em>}
        </span>
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
