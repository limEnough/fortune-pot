import { JJ, JJH, type Ohaeng } from "./constants";
import {
  computeSaju,
  sipseong,
  ohOfGan,
  ohOfJi,
  ohIdxOfGan,
  ohIdxOfJi,
  isYangGan,
  isYangJi,
} from "./calc";
import { SIP_CAT } from "./text";
import type { SajuInput, SajuResult } from "@/types/saju";

export interface SajuSummary {
  sj: SajuResult;
  /** 생년월일을 쪼갠 문자열 — "1993", "05", "03" */
  y: string;
  mo: string;
  d: string;
  /** "인시(寅)" 또는 "시각 미입력" */
  hourTxt: string;
  /** 일간 기준 십성 — 천간용 / 지지용 */
  sipGan: (g: number) => string;
  sipJi: (z: number) => string;
  /** 여덟 글자(시주를 모르면 여섯 글자)의 오행 집계 */
  tally: Record<Ohaeng, number>;
  total: number;
  els: Ohaeng[];
  maxEl: Ohaeng;
  minEl: Ohaeng;
  ilOh: Ohaeng;
  /** "신강한" | "신약한" | "균형 잡힌" */
  strength: string;
  /** 십성 5분류 집계 (일간 제외) */
  catCnt: Record<string, number>;
  /** 가장 많이 나온 십성 */
  domSip: string;
}

/**
 * 명식·오행·십성 집계를 한 번에 낸다.
 *
 * 화면(`SajuChart`)과 저장용 카드(`lib/share/sajuCard`)가 같은 숫자를 보여야 해서
 * 여기 한 곳에서만 계산한다. 예전엔 화면 컴포넌트 안에 있었다.
 */
export function summarizeSaju(saju: SajuInput): SajuSummary {
  const sj = computeSaju(saju.birth, saju.hourIdx);
  const [y, mo, d] = saju.birth.split("-");
  const hourTxt =
    saju.hourIdx === null
      ? "시각 미입력"
      : `${JJ[saju.hourIdx]}시(${JJH[saju.hourIdx]})`;

  const ilOhIdx = ohIdxOfGan(sj.ilgan);
  const ilYang = isYangGan(sj.ilgan);
  const sipGan = (g: number) =>
    sipseong(ilOhIdx, ilYang, ohIdxOfGan(g), isYangGan(g));
  const sipJi = (z: number) =>
    sipseong(ilOhIdx, ilYang, ohIdxOfJi(z), isYangJi(z));

  // 오행 집계
  const oCells: Ohaeng[] = [
    ohOfGan(sj.year[0]),
    ohOfJi(sj.year[1]),
    ohOfGan(sj.month[0]),
    ohOfJi(sj.month[1]),
    ohOfGan(sj.day[0]),
    ohOfJi(sj.day[1]),
  ];
  if (sj.hour) oCells.push(ohOfGan(sj.hour[0]), ohOfJi(sj.hour[1]));
  const tally: Record<Ohaeng, number> = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
  oCells.forEach((o) => (tally[o] += 1));
  const total = oCells.length;
  const els = Object.keys(tally) as Ohaeng[];
  const maxEl = els.reduce((a, b) => (tally[a] >= tally[b] ? a : b));
  const minEl = els.reduce((a, b) => (tally[a] <= tally[b] ? a : b));
  const ilOh = ohOfGan(sj.ilgan);
  const strength =
    tally[ilOh] >= 3 ? "신강한" : tally[ilOh] <= 1 ? "신약한" : "균형 잡힌";

  // 십성 집계 (일간 제외)
  const sipList = [
    sipGan(sj.year[0]),
    sipGan(sj.month[0]),
    sipJi(sj.year[1]),
    sipJi(sj.month[1]),
    sipJi(sj.day[1]),
  ];
  if (sj.hour) sipList.push(sipGan(sj.hour[0]), sipJi(sj.hour[1]));
  const sipCnt: Record<string, number> = {};
  sipList.forEach((s) => (sipCnt[s] = (sipCnt[s] || 0) + 1));
  const catCnt: Record<string, number> = {
    비겁: 0,
    식상: 0,
    재성: 0,
    관성: 0,
    인성: 0,
  };
  sipList.forEach((s) => (catCnt[SIP_CAT[s]] += 1));
  const domSip = Object.keys(sipCnt).reduce((a, b) =>
    sipCnt[a] >= sipCnt[b] ? a : b,
  );

  return {
    sj, y, mo, d, hourTxt, sipGan, sipJi,
    tally, total, els, maxEl, minEl, ilOh, strength,
    catCnt, domSip,
  };
}
