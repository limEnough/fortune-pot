"use client";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface SessionState {
  /** 이번 세션에 "최근 정보로 이용" 을 확인했는지 */
  confirmed: boolean;
  /** 이번 세션에 팝업을 닫았는지 — 확인도 초기화도 아닌 '나중에' */
  asked: boolean;
  confirm: () => void;
  markAsked: () => void;
  reset: () => void;
}

/**
 * "이번엔 이 사람 정보로 볼게요" 라는 확인.
 *
 * 사주 정보 자체는 localStorage(`fortunepot-guest`)에 계속 남는다. 다음 주에
 * 다시 와도 있어야 재방문할 이유가 되기 때문이다. 반면 **이 확인은 세션까지만**
 * 산다 — 탭을 새로 열면 한 번 더 묻는 편이, 친구 사주를 보러 들어왔는데 계속 내
 * 정보로 조회되는 것보다 낫다. 초기화 버튼을 찾아 헤매게 만들지 않는다.
 *
 * 그래서 저장소가 sessionStorage 다. 탭을 닫으면 이 값만 사라지고 사주는 남는다.
 */
export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      confirmed: false,
      asked: false,
      confirm: () => set({ confirmed: true, asked: true }),
      markAsked: () => set({ asked: true }),
      reset: () => set({ confirmed: false, asked: false }),
    }),
    {
      name: "fortunepot-session",
      storage: createJSONStorage(() =>
        typeof window === "undefined" ? (undefined as unknown as Storage) : sessionStorage,
      ),
    },
  ),
);
