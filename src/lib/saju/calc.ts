import { Solar } from "lunar-javascript";
import { CG_OH, JJ_OH, OH_IDX, type Ohaeng } from "./constants";
import type { SajuResult } from "@/types/saju";

// 자(0)→0:30, 축(1)→2:30, ... 해(11)→22:30 — 각 시지의 중앙 시각
const HOUR_CENTERS = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];

const KST_STD_LON = 135;        // 한국 표준시 기준 자오선
const DEFAULT_LON = 126.9784;   // 서울 경도 — 출생지 미입력 시 기본값

// 균시차(분). NOAA 근사식.
function equationOfTimeMin(date: Date): number {
  const start = Date.UTC(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - start) / 86400000);
  const B = ((dayOfYear - 81) * 2 * Math.PI) / 365;
  return 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);
}

// 한국 표준시(시계시각) → 진태양시 변환 (분 단위 오프셋)
function trueSolarOffsetMin(date: Date, lon: number): number {
  return -(KST_STD_LON - lon) * 4 + equationOfTimeMin(date);
}

/**
 * 생년월일(+시각)로 사주 명식을 계산한다.
 * lunar-javascript 기반 — 입춘·각월 절입 시각, 23시 자시 경계까지 반영된 정식 만세력.
 * 한국 표준시 입력을 진태양시(경도 보정 + 균시차)로 환산한 뒤 명식을 산출한다.
 */
export function computeSaju(birth: string, hourIdx: number | null): SajuResult {
  const [y, m, d] = birth.split("-").map(Number);
  const hasHour = hourIdx !== null && hourIdx !== undefined;
  const h = hasHour ? HOUR_CENTERS[hourIdx] : 12;
  const min = hasHour ? 30 : 0;

  const civil = new Date(y, m - 1, d, h, min);
  const tst = new Date(civil.getTime() + trueSolarOffsetMin(civil, DEFAULT_LON) * 60000);

  const lunar = Solar.fromYmdHms(
    tst.getFullYear(), tst.getMonth() + 1, tst.getDate(),
    tst.getHours(), tst.getMinutes(), tst.getSeconds()
  ).getLunar();

  const year: [number, number] = [lunar.getYearGanIndexExact(), lunar.getYearZhiIndexExact()];
  const month: [number, number] = [lunar.getMonthGanIndexExact(), lunar.getMonthZhiIndexExact()];
  const day: [number, number] = [lunar.getDayGanIndexExact(), lunar.getDayZhiIndexExact()];
  const hour: [number, number] | null = hasHour
    ? [lunar.getTimeGanIndex(), lunar.getTimeZhiIndex()]
    : null;

  return { year, month, day, hour, ilgan: day[0] };
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
