"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface RoomState {
  /** 공유 링크에 들어가는 방 id */
  id: string | null;
  /** 주인만 아는 열쇠 — 이게 있어야 방을 고칠 수 있다 */
  token: string | null;
  setRoom: (id: string, token: string) => void;
  clear: () => void;
}

/**
 * 내 방의 주소록.
 *
 * 방 내용은 서버(KV)에 있고 브라우저에는 id·열쇠만 남는다. 귀인지도와 같은 방식이지만
 * 잃었을 때의 무게가 다르다 — 지도는 다시 그리면 되지만 방은 며칠씩 모은 포인트와
 * 사 둔 아이템이 함께 사라진다. 그래서 방을 만든 직후에 **복구 코드**(id.열쇠)를
 * 보여주고 복사하도록 권한다. 나중에 로그인을 붙이면 이 값이 계정 연결 열쇠가 된다.
 */
export const useRoomStore = create<RoomState>()(
  persist(
    (set) => ({
      id: null,
      token: null,
      setRoom: (id, token) => set({ id, token }),
      clear: () => set({ id: null, token: null }),
    }),
    { name: "fortunepot-room" },
  ),
);

/** 사용자에게 보여줄 복구 코드 */
export const recoveryCode = (id: string, token: string) => `${id}.${token}`;

/** 복구 코드를 되돌린다. 형식이 아니면 null */
export function parseRecoveryCode(code: string): { id: string; token: string } | null {
  const [id, token] = code.trim().split(".");
  if (!id || !token) return null;
  return { id, token };
}

/** 서버에 "내가 주인이다" 를 증명하는 헤더 */
export function ownerHeaders(token: string | null): HeadersInit {
  return token ? { "x-fp-owner": token } : {};
}
