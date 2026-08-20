export type Gender = "남" | "여";

export interface SajuInput {
  name: string;
  birth: string;          // "YYYY-MM-DD" (양력)
  hourIdx: number | null; // 0(자)~11(해), 모르면 null
  /*
   * 아직 안 받았으면 null.
   *
   * 귀인지도는 이름·생일·시각만 받아서 지도를 그리고, 그 값을 여기에 심어둔다.
   * 그래서 성별만 비어 있는 상태가 생긴다. 궁합·명식 계산에는 성별이 쓰이지
   * 않지만 사주 화면은 표시에 쓰므로, 그쪽으로 갈 때 입력 폼에서 채운다.
   */
  gender: Gender | null;
}

/** 운세·사주 화면이 요구하는 완전한 입력 */
export const isComplete = (s: SajuInput | null): s is SajuInput =>
  !!s && s.gender !== null;

export type Pillar = [number, number]; // [천간 idx, 지지 idx]

export interface SajuResult {
  year: Pillar;
  month: Pillar;
  day: Pillar;
  hour: Pillar | null;
  ilgan: number; // 일간 천간 idx
}
