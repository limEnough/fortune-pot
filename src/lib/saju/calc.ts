import { CG_OH, JJ_OH, OH_IDX, type Ohaeng } from "./constants";
import type { SajuResult } from "@/types/saju";

const mod = (n: number, m: number) => ((n % m) + m) % m;

function jdn(y: number, m: number, d: number): number {
  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  return (
    d + Math.floor((153 * mm + 2) / 5) + 365 * yy +
    Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045
  );
}

/**
 * 생년월일(+시각)로 사주 명식을 계산한다.
 * ⚠️ 프로토타입용 간이 만세력: 절기·진태양시 미반영(연/월 경계 단순화).
 *    운영 시 검증된 만세력 라이브러리나 KASI 절기 데이터로 교체할 것.
 */
export function computeSaju(birth: string, hourIdx: number | null): SajuResult {
  const [y, m, d] = birth.split("-").map(Number);

  let sm = m;
  if (d < 6) { sm = m - 1; if (sm === 0) sm = 12; }

  let yForYear = y;
  if (m < 2 || (m === 2 && d < 4)) yForYear = y - 1;

  const yg = mod(yForYear - 4, 10);
  const yz = mod(yForYear - 4, 12);

  const mz = mod(sm, 12);
  const base = mod((yg % 5) * 2 + 2, 10);     // 오호둔
  const mg = mod(base + mod(mz - 2, 12), 10);

  const J = jdn(y, m, d);
  const dg = mod(J + 9, 10);
  const dz = mod(J + 1, 12);

  let hour: [number, number] | null = null;
  if (hourIdx !== null && hourIdx !== undefined) {
    const hg = mod((dg % 5) * 2 + hourIdx, 10); // 오자둔
    hour = [hg, hourIdx];
  }

  return { year: [yg, yz], month: [mg, mz], day: [dg, dz], hour, ilgan: dg };
}

export function sipseong(dayOh: number, dayYang: boolean, oh: number, yang: boolean): string {
  const same = dayYang === yang;
  if (oh === dayOh) return same ? "비견" : "겁재";
  if (oh === (dayOh + 1) % 5) return same ? "식신" : "상관";
  if (oh === (dayOh + 2) % 5) return same ? "편재" : "정재";
  if (oh === (dayOh + 3) % 5) return same ? "편관" : "정관";
  return same ? "편인" : "정인";
}

export const ohOfGan = (g: number): Ohaeng => CG_OH[g] as Ohaeng;
export const ohOfJi = (z: number): Ohaeng => JJ_OH[z] as Ohaeng;
export const ohIdxOfGan = (g: number) => OH_IDX[CG_OH[g] as Ohaeng];
export const ohIdxOfJi = (z: number) => OH_IDX[JJ_OH[z] as Ohaeng];
export const isYangGan = (g: number) => g % 2 === 0;
export const isYangJi = (z: number) => z % 2 === 0;
