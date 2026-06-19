import { Solar } from "lunar-javascript";
import { CG_OH, JJ_OH, OH_IDX, type Ohaeng } from "./constants";
import type { SajuResult } from "@/types/saju";

// 자(0)→0:30, 축(1)→2:30, ... 해(11)→22:30 — 각 시지의 중앙 시각
const HOUR_CENTERS = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];

/**
 * 생년월일(+시각)로 사주 명식을 계산한다.
 * lunar-javascript 기반 — 입춘·각월 절입 시각, 23시 자시 경계까지 반영된 정식 만세력.
 */
export function computeSaju(birth: string, hourIdx: number | null): SajuResult {
  const [y, m, d] = birth.split("-").map(Number);
  const hasHour = hourIdx !== null && hourIdx !== undefined;
  const h = hasHour ? HOUR_CENTERS[hourIdx] : 12;
  const min = hasHour ? 30 : 0;

  const lunar = Solar.fromYmdHms(y, m, d, h, min, 0).getLunar();

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
