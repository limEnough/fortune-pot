import type { Chemi, RoleKey } from "@/lib/saju/chemi";

export type Calendar = "solar" | "lunar";

/** 지도에 이름을 올릴 때 받는 것 — 캡쳐 화면과 같이 이름·생년월일·달력뿐 */
export interface JoinInput {
  name: string;
  /** "YYYY-MM-DD" — cal 이 lunar 면 음력 날짜 */
  birth: string;
  cal: Calendar;
  /**
   * 브라우저가 들고 있는 임의 id. 같은 사람이 고쳐 올릴 때 한 줄로 합치는 데만 쓴다.
   * 지도를 만들 때는 필요 없다.
   */
  visitor?: string;
}

/**
 * 지도에 올라온 한 사람. **생년월일은 들어 있지 않다** —
 * 궁합은 서버에서 계산해 결과만 내려보내고, 남의 생일은 브라우저로 나가지 않는다.
 */
export interface MapMember extends Chemi {
  id: string;
  name: string;
  /** 올라온 시각(ms) */
  at: number;
}

/** 지도 주인 — 가운데 달 */
export interface MapOwner {
  name: string;
  ohaeng: string;
  emoji: string;
  nick: string;
}

/** 주인이 보는 내 지도 */
export interface MapView {
  id: string;
  owner: MapOwner;
  members: MapMember[];
}

/** 공유 링크로 들어온 사람이 보는 것 — 주인 이름만 */
export interface MapIntro {
  id: string;
  ownerName: string;
  count: number;
}

/** 합류 결과 — "나는 OO님에게 어떤 사람일까?" 의 답 */
export interface JoinResult {
  ownerName: string;
  member: MapMember;
  /** 지도에서 이 유형이 몇 명째인지 */
  sameRole: number;
  role: RoleKey;
  /** 새로 올라간 게 아니라 이미 있던 줄을 고친 것 */
  updated: boolean;
}
