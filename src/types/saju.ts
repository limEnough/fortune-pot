export type Gender = "남" | "여";

export interface SajuInput {
  name: string;
  birth: string;          // "YYYY-MM-DD"
  hourIdx: number | null; // 0(자)~11(해), 모르면 null
  gender: Gender;
}

export type Pillar = [number, number]; // [천간 idx, 지지 idx]

export interface SajuResult {
  year: Pillar;
  month: Pillar;
  day: Pillar;
  hour: Pillar | null;
  ilgan: number; // 일간 천간 idx
}
