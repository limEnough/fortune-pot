"use client";
import { useState } from "react";
import { parseBirthDigits } from "@/lib/map/birth";
import { HOUR_OPTIONS } from "@/lib/saju/constants";
import type { Calendar, JoinInput } from "@/lib/map/types";

interface Props {
  title: React.ReactNode;
  desc?: React.ReactNode;
  submitLabel: string;
  busyLabel?: string;
  namePlaceholder?: string;
  /** 이미 올린 적이 있을 때의 안내 — 폼 맨 위에 붙는다 */
  notice?: React.ReactNode;
  /** 지난번에 올린 값으로 채워둔다. 틀린 칸만 고치면 되게 */
  initial?: Partial<Omit<JoinInput, "visitor">>;
  /** 제출 버튼 앞에 붙는 그림 — 무엇을 하는 버튼인지 글자보다 빨리 읽힌다 */
  submitIcon?: React.ReactNode;
  /** 제출 버튼과 나란히 설 다른 길 — 올릴 생각 없이 들어온 사람도 있다 */
  extra?: React.ReactNode;
  onSubmit: (input: JoinInput) => Promise<void>;
}

/**
 * 이름 + 생년월일 여섯 자리 + 양/음력 + 태어난 시간.
 *
 * 지도를 만들 때(주인)와 링크로 들어와 이름을 올릴 때(친구) 둘 다 이 폼을 쓴다.
 * 생년월일을 캘린더가 아니라 여섯 자리 숫자로 받는 건 남의 링크에서 채우는
 * 칸이기 때문이다 — 한 칸에 숫자만 두드리고 끝나는 쪽이 이탈이 적다.
 * 성별은 궁합에 쓰이지 않으므로 받지 않는다.
 *
 * 시간은 모르는 사람이 많아서 **모르겠어요가 기본값**이다. 시주가 있으면 오행
 * 여덟 글자로 세어 케미가 조금 더 정확해지고, 없어도 일간 기준이라 결과는 나온다.
 */
export default function JoinForm({
  title, desc, submitLabel, busyLabel = "그리는 중…", namePlaceholder = "이름 또는 별명",
  notice, initial, submitIcon, extra, onSubmit,
}: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [digits, setDigits] = useState(initial?.birth ? initial.birth.replace(/-/g, "") : "");
  const [cal, setCal] = useState<Calendar>(initial?.cal ?? "solar");
  const [hourIdx, setHourIdx] = useState<number | null>(initial?.hourIdx ?? null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const unknownHour = hourIdx === null;

  const submit = async () => {
    const birth = parseBirthDigits(digits);
    if (!name.trim()) return setErr("이름을 입력해 주세요.");
    if (!birth) return setErr("생년월일을 여섯 자리로 입력해 주세요. 예) 930821");

    setErr(null);
    setBusy(true);
    try {
      await onSubmit({ name: name.trim(), birth, cal, hourIdx });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "잠시 후 다시 시도해 주세요.");
      setBusy(false);
    }
  };

  const submitBtn = (
    <button
      // 짝이 있으면 폭을 나눠 쓰고, 혼자면 한 줄을 다 쓴다
      className={`btn primary focusable ${extra ? "" : "block"}`}
      disabled={busy}
      onClick={submit}
    >
      {submitIcon && (
        <span className="btn-ic" aria-hidden="true">
          {submitIcon}
        </span>
      )}
      {busy ? busyLabel : submitLabel}
    </button>
  );

  return (
    <div className="join-card">
      <h2 className="join-title">{title}</h2>
      {desc && <p className="join-desc">{desc}</p>}
      {notice && <div className="join-notice">{notice}</div>}

      <input
        className="input focusable"
        value={name}
        maxLength={12}
        placeholder={namePlaceholder}
        onChange={(e) => setName(e.target.value)}
      />

      <div className="join-row">
        <input
          className="input focusable"
          value={digits}
          inputMode="numeric"
          maxLength={8}
          placeholder="생년월일 · 예) 930821"
          onChange={(e) => setDigits(e.target.value.replace(/\D/g, ""))}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
        />
        <div className="seg cal">
          <button
            type="button"
            className={`focusable ${cal === "solar" ? "on" : ""}`}
            onClick={() => setCal("solar")}
          >
            양력
          </button>
          <button
            type="button"
            className={`focusable ${cal === "lunar" ? "on" : ""}`}
            onClick={() => setCal("lunar")}
          >
            음력
          </button>
        </div>
      </div>

      <div className="join-hour">
        <select
          className="input focusable"
          value={unknownHour ? "" : hourIdx}
          disabled={unknownHour}
          onChange={(e) => setHourIdx(Number(e.target.value))}
          aria-label="태어난 시간"
        >
          <option value="" disabled>
            태어난 시간
          </option>
          {HOUR_OPTIONS.slice(1).map((opt, i) => (
            <option key={i} value={i}>
              {opt}
            </option>
          ))}
        </select>

        <label className="check focusable">
          <input
            type="checkbox"
            checked={unknownHour}
            onChange={(e) => setHourIdx(e.target.checked ? null : 6)}
          />
          <span className="box" aria-hidden="true" />
          모르겠어요
        </label>
        <span className="hint">몰라도 괜찮아요 · 시간을 넣으면 케미가 조금 더 정확해져요</span>
      </div>

      {err && <p className="join-err">{err}</p>}

      {extra ? <div className="join-actions">{submitBtn}{extra}</div> : submitBtn}
    </div>
  );
}
