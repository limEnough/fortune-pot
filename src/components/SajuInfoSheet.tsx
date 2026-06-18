"use client";
import { useRouter } from "next/navigation";
import type { SajuInput } from "@/types/saju";
import { CG, CGH, JJ, JJH } from "@/lib/saju/constants";
import { computeSaju } from "@/lib/saju/calc";

interface Props {
  saju: SajuInput;
  open: boolean;
  onClose: () => void;
}

/** 운세 페이지 상단 트리거로 여는, 입력한 사주 정보 확인 바텀시트 */
export default function SajuInfoSheet({ saju, open, onClose }: Props) {
  const router = useRouter();
  const sj = computeSaju(saju.birth, saju.hourIdx);
  const [y, m, d] = saju.birth.split("-");
  const hourTxt = saju.hourIdx === null ? "모름" : `${JJ[saju.hourIdx]}시 (${JJH[saju.hourIdx]})`;

  const rows: [string, string][] = [
    ["이름", saju.name],
    ["생년월일", `${y}년 ${m}월 ${d}일`],
    ["태어난 시각", hourTxt],
    ["성별", `${saju.gender}성`],
    ["일간 (日干)", `${CG[sj.ilgan]} (${CGH[sj.ilgan]})`],
  ];

  const goEdit = () => { onClose(); router.push("/onboarding"); };
  const goFull = () => { onClose(); router.push("/saju"); };

  return (
    <>
      <div className={`sheet-scrim ${open ? "show" : ""}`} onClick={onClose} />
      <div className={`sheet ${open ? "show" : ""}`} role="dialog" aria-label="내 사주 정보">
        <div className="grip" />
        <h3>내 사주 정보</h3>
        <p>입력한 정보를 확인하고 수정할 수 있어요</p>

        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--line)",
            borderRadius: 16,
            overflow: "hidden",
            marginBottom: 16,
          }}
        >
          {rows.map(([k, v], i) => (
            <div
              key={k}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "13px 16px",
                fontSize: 14,
                borderBottom: i < rows.length - 1 ? "1px solid var(--line)" : "none",
              }}
            >
              <span style={{ color: "var(--muted)" }}>{k}</span>
              <b style={{ color: "#f3ecff", fontWeight: 700 }}>{v}</b>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button className="btn primary block focusable" onClick={goFull}>전체 사주 풀이 보기</button>
          <button className="btn ghost block focusable" onClick={goEdit}>사주 정보 수정하기</button>
        </div>
      </div>
    </>
  );
}
