"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSaju } from "@/hooks/useSaju";
import { HOUR_OPTIONS } from "@/lib/saju/constants";
import type { Gender } from "@/types/saju";

export default function SajuForm() {
  const router = useRouter();
  const { saju, save } = useSaju();
  const [name, setName] = useState(saju?.name ?? "");
  const [birth, setBirth] = useState(saju?.birth ?? "1996-06-16");
  const [hour, setHour] = useState<number>(saju ? (saju.hourIdx ?? -1) + 1 : 6);
  const [gender, setGender] = useState<Gender>(saju?.gender ?? "여");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
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
      <div className="form-head">
        <h2>{saju ? "사주정보 수정" : "사주 정보 입력"}</h2>
        <span>정확한 풀이를 위해 태어난 순간을 알려주세요</span>
      </div>

      <label className="field"><span className="lab">이름</span>
        <input className="input focusable" value={name} placeholder="이름을 입력하세요" onChange={(e) => setName(e.target.value)} />
      </label>

      <label className="field"><span className="lab">생년월일</span>
        <input className="input focusable" type="date" value={birth} onChange={(e) => setBirth(e.target.value)} />
      </label>

      <label className="field"><span className="lab">태어난 시각</span>
        <select className="input focusable" value={hour} onChange={(e) => setHour(Number(e.target.value))}>
          {HOUR_OPTIONS.map((opt, i) => (<option key={i} value={i}>{opt}</option>))}
        </select>
        <span className="hint">모르면 비워두어도 풀이는 가능해요</span>
      </label>

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
