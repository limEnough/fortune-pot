"use client";
import { useMemo, useState } from "react";
import ClayChar from "./ClayChar";
import SaveCardButton from "./SaveCardButton";
import type { SajuInput } from "@/types/saju";
import {
  CG,
  CGH,
  JJ,
  JJH,
  JJ_ANI,
  OH_COLOR,
  type Ohaeng,
} from "@/lib/saju/constants";
import { computeSaju, ohOfGan, ohOfJi, isYangGan } from "@/lib/saju/calc";
import { summarizeSaju } from "@/lib/saju/summary";
import { drawSajuCard } from "@/lib/share/sajuCard";
import {
  ILGAN_DETAIL,
  OH_BOWAN,
  OH_DETAIL,
  SIP_STAR,
  SIP_DESC,
  SIP_CAT,
  SIP_CAT_DETAIL,
  CAT_THEME,
} from "@/lib/saju/text";

function todayStr(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const ohC = (o: Ohaeng) => OH_COLOR[o];

export default function SajuChart({ saju }: { saju: SajuInput }) {
  const [showOhInfo, setShowOhInfo] = useState(false);
  const [showSipInfo, setShowSipInfo] = useState(false);

  /*
   * 명식·오행·십성·세운을 한 번에 계산한다.
   *
   * 원래는 전부 렌더 본문에 있어서 오행/십성 패널을 접었다 펼 때마다
   * computeSaju 가 두 번(본명식 + 오늘) 다시 돌았다. 입력이 그대로면 결과도
   * 그대로이므로 saju 가 바뀔 때만 계산한다. new Date() 도 여기로 넣어
   * 렌더 중에 시간이 바뀌는 일이 없게 했다.
   *
   * 집계 자체는 `summarizeSaju` 가 맡는다 — 저장용 카드도 같은 숫자를 써야 해서
   * 화면 안에 두지 않았다. 세운·월운은 화면에만 있어 여기서 붙인다.
   */
  const calc = useMemo(() => {
    const now = new Date();
    return {
      ...summarizeSaju(saju),
      now,
      cur: computeSaju(todayStr(now), null),
    };
  }, [saju]);

  const {
    sj, y, mo, d, hourTxt, sipGan, sipJi,
    tally, total, els, maxEl, minEl, ilOh, strength,
    catCnt, domSip, now, cur,
  } = calc;

  const Cell = ({
    g,
    z,
    day,
  }: {
    g: number | null;
    z: number | null;
    day?: boolean;
  }) => {
    if (g === null || z === null) {
      return (
        <>
          <div className="cell unknown">
            <div className="hz">?</div>
            <div className="kr">미입력</div>
          </div>
          <div className="cell unknown">
            <div className="hz">?</div>
            <div className="kr">미입력</div>
          </div>
        </>
      );
    }
    const go = ohOfGan(g),
      zo = ohOfJi(z);
    return (
      <>
        <div
          className="cell gan"
          style={{
            background: ohC(go).bg,
            color: ohC(go).c,
            borderColor: ohC(go).c + "55",
          }}
        >
          <div className="ss">{day ? "일원" : sipGan(g)}</div>
          <div className="hz">{CGH[g]}</div>
          <div className="kr">{CG[g]}</div>
          <div className="oh">{go}</div>
        </div>
        <div
          className="cell ji"
          style={{
            background: ohC(zo).bg,
            color: ohC(zo).c,
            borderColor: ohC(zo).c + "55",
          }}
        >
          <div className="ss">{sipJi(z)}</div>
          <div className="hz">{JJH[z]}</div>
          <div className="kr">
            {JJ[z]}·{JJ_ANI[z]}
          </div>
          <div className="oh">{zo}</div>
        </div>
      </>
    );
  };

  const pillars = [
    { lab: "시주", p: sj.hour, day: false },
    { lab: "일주", p: sj.day, day: true },
    { lab: "월주", p: sj.month, day: false },
    { lab: "년주", p: sj.year, day: false },
  ];

  const FlowCard = ({
    label,
    p,
    sub,
  }: {
    label: string;
    p: [number, number];
    sub: string;
  }) => {
    const g = p[0],
      z = p[1],
      go = ohOfGan(g),
      sip = sipGan(g),
      cat = SIP_CAT[sip];
    return (
      <div className="flow-card">
        <div className="ft">{label}</div>
        <div className="fg" style={{ color: ohC(go).c }}>
          {CGH[g]}
          {JJH[z]}{" "}
          <small>
            {CG[g]}
            {JJ[z]}
          </small>
        </div>
        <div className="fs">
          {sip} · {SIP_STAR[sip]}
        </div>
        <div className="fp">
          {sub} <b>{cat}</b>의 기운이 들어와 {CAT_THEME[cat]} 흐름이에요.
        </div>
      </div>
    );
  };

  return (
    <div className="saju">
      <div className="saju-hero">
        <ClayChar size="sm" variant="love" />
        <div className="saju-head">
          <h2>
            <b style={{ color: "var(--magic)" }}>{saju.name}</b>님의 사주
          </h2>
          <div className="meta">
            {y}년 {mo}월 {d}일 · {hourTxt} · {saju.gender}성
          </div>
        </div>
      </div>

      <div className="sec-lab">
        📜 사주 명식 <small>四柱八字 · 십성 포함</small>
      </div>
      <div className="ganji">
        {pillars.map((pl) => (
          <div className={`pillar ${pl.day ? "day" : ""}`} key={pl.lab}>
            <div className="plab">
              {pl.lab}
              {pl.day && <b>일간</b>}
            </div>
            {pl.p ? (
              <Cell g={pl.p[0]} z={pl.p[1]} day={pl.day} />
            ) : (
              <Cell g={null} z={null} />
            )}
          </div>
        ))}
      </div>

      <div className="sec-lab">
        ⚖️ 오행 분석 <small>五行</small>
        <button
          type="button"
          className="oh-more"
          aria-expanded={showOhInfo}
          aria-controls="oh-info-panel"
          onClick={() => setShowOhInfo((v) => !v)}
        >
          {showOhInfo ? "접기" : "오행 별 특징 보기"}
        </button>
      </div>
      <div className="oh-list">
        {els.map((k) => {
          const pct = total ? Math.round((tally[k] / total) * 100) : 0;
          return (
            <div className="oh-row" key={k}>
              <div className="name" style={{ color: ohC(k).c }}>
                {k}
              </div>
              <div className="bar">
                <i style={{ width: `${pct}%`, background: ohC(k).c }} />
              </div>
              <div className="cnt">{tally[k]}</div>
            </div>
          );
        })}
        {showOhInfo && (
          <div
            id="oh-info-panel"
            className="oh-info"
            role="region"
            aria-label="오행이 많을 때 특징"
          >
            <div className="oh-info-head">
              오행이 많을 때 특징 <small>장점·주의·조언</small>
            </div>
            {els.map((k) => {
              const d = OH_DETAIL[k];
              return (
                <div
                  className="oh-info-card"
                  key={k}
                  style={{
                    borderColor: ohC(k).c + "55",
                    background: ohC(k).bg,
                  }}
                >
                  <div className="oh-info-title">
                    <span className="dot" style={{ background: ohC(k).c }} />
                    <b style={{ color: ohC(k).c }}>{k}</b>
                    <span className="trait">{d.trait}</span>
                  </div>
                  <div className="oh-info-row">
                    <b>장점</b>
                    <span>{d.pros}</span>
                  </div>
                  <div className="oh-info-row">
                    <b>주의</b>
                    <span>{d.cons}</span>
                  </div>
                  <div className="oh-info-row">
                    <b>조언</b>
                    <span>{d.tip}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="sec-lab">
        ⭐ 십성 카드 <small>十星</small>
        <button
          type="button"
          className="oh-more"
          aria-expanded={showSipInfo}
          aria-controls="sip-info-panel"
          onClick={() => setShowSipInfo((v) => !v)}
        >
          {showSipInfo ? "접기" : "십성 별 특징 보기"}
        </button>
      </div>
      <div className="sip-cats">
        {Object.keys(catCnt).map((k) => (
          <div className="sip-cat" key={k}>
            <span className="cn">{k}</span>
            <span className="cv">{catCnt[k]}</span>
          </div>
        ))}
      </div>
      {showSipInfo && (
        <div
          id="sip-info-panel"
          className="sip-info"
          role="region"
          aria-label="십성이 많을 때 특징"
        >
          <div className="oh-info-head">
            십성이 많을 때 특징 <small>장점·주의·조언</small>
          </div>
          {Object.keys(catCnt).map((k) => {
            const d = SIP_CAT_DETAIL[k];
            return (
              <div className="oh-info-card sip-info-card" key={k}>
                <div className="oh-info-title">
                  <span className="dot" />
                  <b>{k}</b>
                  <span className="trait">{d.trait}</span>
                </div>
                <div className="oh-info-row">
                  <b>장점</b>
                  <span>{d.pros}</span>
                </div>
                <div className="oh-info-row">
                  <b>주의</b>
                  <span>{d.cons}</span>
                </div>
                <div className="oh-info-row">
                  <b>조언</b>
                  <span>{d.tip}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <div className="saju-card">
        <div className="t">
          {domSip} · {SIP_STAR[domSip]}
        </div>
        <p>
          사주에서 <b style={{ color: "var(--magic)" }}>{domSip}</b>의 기운이
          가장 도드라져요.
        </p>
        <p>{SIP_DESC[domSip]}</p>
      </div>

      <div className="sec-lab">
        🌗 올해와 이달의 흐름 <small>歲運·月運</small>
      </div>
      <div className="flow">
        <FlowCard
          label={`${now.getFullYear()}년 세운`}
          p={cur.year}
          sub="올해는"
        />
        <FlowCard
          label={`${now.getMonth() + 1}월 월운`}
          p={cur.month}
          sub="이달은"
        />
      </div>

      <div className="saju-card">
        <div className="t">
          🔮 일간 풀이 · {CGH[sj.ilgan]}
          {CG[sj.ilgan]}
        </div>
        <p>
          당신의 사주 주인공(일간)은{" "}
          <b>
            {CG[sj.ilgan]}({CGH[sj.ilgan]})
          </b>
          , 오행으로는 <b style={{ color: ohC(ilOh).c }}>{ilOh}</b> ·{" "}
          <b>{isYangGan(sj.ilgan) ? "양(陽)" : "음(陰)"}</b>의 기운이에요.
        </p>
        <p>
          <b>{ILGAN_DETAIL[sj.ilgan].alias}</b>으로 비유돼요.
        </p>
        <div className="ilgan-grid">
          <div className="ilgan-row">
            <b>🌱 성격</b>
            <span>{ILGAN_DETAIL[sj.ilgan].personality}</span>
          </div>
          <div className="ilgan-row">
            <b>🤝 관계</b>
            <span>{ILGAN_DETAIL[sj.ilgan].relation}</span>
          </div>
          <div className="ilgan-row">
            <b>💼 일·재물</b>
            <span>{ILGAN_DETAIL[sj.ilgan].work}</span>
          </div>
          <div className="ilgan-row">
            <b>🪄 조언</b>
            <span>{ILGAN_DETAIL[sj.ilgan].advice}</span>
          </div>
        </div>
      </div>

      <div className="saju-card">
        <div className="t">🌿 오행 균형</div>
        <p>
          여덟 글자 중 <b style={{ color: ohC(maxEl).c }}>{maxEl}</b> 기운이
          가장 강하고, <b style={{ color: ohC(minEl).c }}>{minEl}</b> 기운이
          가장 적어요. 일간 기준으로는 <b>{strength}</b> 편입니다.
        </p>
        <p>
          부족한 <b style={{ color: ohC(minEl).c }}>{minEl}</b>의 기운은{" "}
          <b>{OH_BOWAN[minEl]}</b>으로 보완하면 흐름이 한결 부드러워져요.
        </p>
      </div>

      <SaveCardButton
        label="사주 정보 이미지로 저장"
        title="내 사주 카드"
        hint="명식·오행·십성·일간 풀이를 한 장에 담았어요"
        filename={`포춘팟_사주_${saju.name}_${saju.birth}.png`}
        render={() => drawSajuCard(saju)}
      />

      <div className="saju-note">
        ※ 명식은 lunar-javascript 만세력에 서울 경도 기준 진태양시(균시차 포함)
        보정을 적용해 계산합니다. 출생지가 서울에서 멀거나 시지 경계 부근이면
        오차가 있을 수 있어요.
      </div>
    </div>
  );
}
