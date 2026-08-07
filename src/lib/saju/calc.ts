import type { Solar as SolarClass } from "lunar-javascript";
import { CG_OH, JJ_OH, OH_IDX, type Ohaeng } from "./constants";
import type { SajuResult } from "@/types/saju";

/*
 * lunar-javascript 는 압축 후에도 100 kB 로 초기 번들의 45% 를 차지하는데,
 * 정작 쓰는 건 명식 계산 한 번뿐이다. 정적 import 를 끊고 필요한 시점에만
 * 받아오도록 지연 로딩한다.
 *
 * computeSaju 자체는 동기로 남긴다 — 호출부(SajuChart·generateFortune)가
 * 전부 렌더 본문이라 async 로 바꾸면 파급이 크다. 대신 화면을 그리기 전에
 * loadManse() 를 반드시 한 번 await 해야 하고, 이는 useManse 훅이 담당한다.
 */
let Solar: typeof SolarClass | null = null;
let pending: Promise<void> | null = null;

/**
 * 만세력 모듈을 받아온다. 여러 번 불러도 요청은 한 번만 나간다.
 *
 * 정적 import 였을 땐 없던 실패 경로가 생겼다 — 청크를 못 받으면 화면이
 * 스켈레톤에서 영영 멈춘다. 실패 시 캐시를 비워 다음 호출이 다시 시도하게 한다.
 */
export function loadManse(): Promise<void> {
  if (Solar) return Promise.resolve();
  if (!pending) {
    pending = import("lunar-javascript")
      .then((m) => {
        Solar = m.Solar;
      })
      .catch((e) => {
        pending = null; // 재시도 가능하게
        throw e;
      });
  }
  return pending;
}

/** 이미 받아왔는지. 훅이 첫 렌더에서 불필요한 로딩 상태를 건너뛰는 데 쓴다. */
export function isManseReady(): boolean {
  return Solar !== null;
}

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
  if (!Solar) {
    throw new Error(
      "만세력이 아직 로드되지 않았습니다. computeSaju 앞에서 loadManse()를 await 하세요(useManse 훅).",
    );
  }
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
