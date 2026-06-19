declare module "lunar-javascript" {
  export class Lunar {
    getYearGanIndexExact(): number;
    getYearZhiIndexExact(): number;
    getMonthGanIndexExact(): number;
    getMonthZhiIndexExact(): number;
    getDayGanIndexExact(): number;
    getDayZhiIndexExact(): number;
    getTimeGanIndex(): number;
    getTimeZhiIndex(): number;
  }
  export class Solar {
    static fromYmdHms(y: number, m: number, d: number, h: number, mn: number, s: number): Solar;
    getLunar(): Lunar;
  }
}
