"use client";
import { useState } from "react";
import { parseBirthDigits } from "@/lib/map/birth";
import type { Calendar, JoinInput } from "@/lib/map/types";

interface Props {
  title: React.ReactNode;
  desc?: React.ReactNode;
  submitLabel: string;
  busyLabel?: string;
  namePlaceholder?: string;
  onSubmit: (input: JoinInput) => Promise<void>;
}

/**
 * 이름 + 생년월일 여섯 자리 + 양/음력.
 *
 * 지도를 만들 때(주인)와 링크로 들어와 이름을 올릴 때(친구) 둘 다 이 폼을 쓴다.
 * 사주 입력 폼(SajuForm)과 달리 시각·성별을 받지 않는다 — 궁합은 일간 오행이
 * 기준이라 시각 없이도 나오고, 남의 링크에서 채울 칸은 적을수록 좋다.
 */
export default function JoinForm({
  title, desc, submitLabel, busyLabel = "그리는 중…", namePlaceholder = "이름 또는 별명", onSubmit,
}: Props) {
  const [name, setName] = useState("");
  const [digits, setDigits] = useState("");
  const [cal, setCal] = useState<Calendar>("solar");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    const birth = parseBirthDigits(digits);
    if (!name.trim()) return setErr("이름을 입력해 주세요.");
    if (!birth) return setErr("생년월일을 여섯 자리로 입력해 주세요. 예) 930821");

    setErr(null);
    setBusy(true);
    try {
      await onSubmit({ name: name.trim(), birth, cal });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "잠시 후 다시 시도해 주세요.");
      setBusy(false);
    }
  };

  return (
    <div className="join-card">
      <h2 className="join-title">{title}</h2>
      {desc && <p className="join-desc">{desc}</p>}

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

      {err && <p className="join-err">{err}</p>}

      <button className="btn primary block focusable" disabled={busy} onClick={submit}>
        {busy ? busyLabel : submitLabel}
      </button>
    </div>
  );
}
