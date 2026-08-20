import type { Chemi, RoleKey } from "@/lib/saju/chemi";

export type Calendar = "solar" | "lunar";

/**
 * 지도에 이름을 올릴 때 받는 것.
 *
 * 성별은 받지 않는다 — 궁합은 일간 오행과 지지 합충으로 내므로 쓸 데가 없고,
 * 남의 링크에서 채우는 칸은 적을수록 좋다. 사주 화면은 성별을 표시에 쓰는데,
 * 그건 그 화면으로 갈 때 입력 폼에서 채운다.
 */
export interface JoinInput {
  name: string;
  /** "YYYY-MM-DD" — cal 이 lunar 면 음력 날짜 */
  birth: string;
  cal: Calendar;
  /** 0(자)~11(해). 모르면 null — 시주 없이도 궁합은 나온다 */
  hourIdx: number | null;
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

/** 펼쳐 본 지도 */
export interface MapView {
  id: string;
  owner: MapOwner;
  members: MapMember[];
  /** 주인이면 고칠 수 있고, 합류자면 읽기만 한다 */
  role: "owner" | "member";
  /** 합류자로 볼 때 목록에서 내 별 — 어디쯤인지 표시하는 데 쓴다 */
  mine?: string;
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
  /** 방금 올린 생일의 양력 환산 — 브라우저가 이 정보를 사주로도 심어둔다 */
  solar: string;
}
