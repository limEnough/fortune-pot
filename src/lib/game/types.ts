import type { ElementKey } from "./elements";
import type { Decor } from "./items";

/**
 * 방 하나. **생년월일은 들어 있지 않다** —
 * 서버로 올라가는 건 사주에서 뽑아낸 결과값(원소)과 꾸미기 상태뿐이다.
 */
export interface RoomView {
  publicId: string;
  element: ElementKey;
  /** 표시용 별명. 없으면 화면에서 "누군가" 로 부른다 */
  nickname: string | null;
  decor: Decor;
  /** 주인일 때만 내려간다 */
  points?: number;
  owned?: string[];
  /** 오늘 출석 보상을 이미 받았는지 — 주인일 때만 */
  claimedToday?: boolean;
  owner: boolean;
}

export interface GuestEntry {
  id: string;
  nickname: string;
  message: string;
  /** 남긴 사람의 오행 캐릭터. 사주를 안 넣은 사람은 없다 */
  element: ElementKey | null;
  at: number;
}

/** 출석 보상 결과 */
export interface RewardResult {
  /** 방금 새로 받았는지. false 면 오늘 몫은 이미 들어와 있다 */
  granted: boolean;
  /** 오늘의 금액(이미 받았어도 같은 값이다 — 결정론적이라서) */
  amount: number;
  /** 지급 후 잔액 */
  points: number;
}
