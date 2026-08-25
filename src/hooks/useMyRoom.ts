"use client";
import { useCallback, useEffect, useState } from "react";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/http";
import { ownerHeaders, useRoomStore } from "@/store/useRoomStore";
import type { ElementKey } from "@/lib/game/elements";
import type { Decor } from "@/lib/game/items";
import type { RewardResult, RoomView } from "@/lib/game/types";

/**
 * 내 방 한 칸을 다루는 훅 — 만들기·불러오기·꾸미기 저장·아이템 구매.
 *
 * 방은 서버에 있으므로 화면이 뜰 때마다 새로 받아온다. 다른 기기에서 꾸몄거나
 * 방명록에 글이 달렸을 수 있고, 무엇보다 **포인트 잔액은 서버가 진실**이다.
 * 브라우저가 들고 있는 값은 눌렀을 때 바로 반응하기 위한 표시용이다.
 */
export function useMyRoom() {
  const { id, token, setRoom, clear } = useRoomStore();
  const [mounted, setMounted] = useState(false);
  const [room, setRoomView] = useState<RoomView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => setMounted(true), []); // localStorage 하이드레이션 대기

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      setRoomView(
        await apiGet<RoomView>(`/api/game/room/${id}`, {
          headers: ownerHeaders(token),
          fallback: "방을 불러오지 못했어요.",
        }),
      );
    } catch (e) {
      // 만료된 방을 붙들고 있으면 영영 빈 화면이라 주소록을 비운다
      if (e instanceof Error && /찾을 수 없/.test(e.message)) clear();
      setError(e instanceof Error ? e.message : "방을 불러오지 못했어요.");
    } finally {
      setLoading(false);
    }
  }, [id, token, clear]);

  useEffect(() => {
    if (mounted) load();
  }, [mounted, load]);

  const create = useCallback(
    async (element: ElementKey, nickname: string | null) => {
      const got = await apiPost<{ publicId: string; token: string }>(
        "/api/game/room",
        { element, nickname },
        "방을 만들지 못했어요.",
      );
      setRoom(got.publicId, got.token);
      return got;
    },
    [setRoom],
  );

  /** 꾸미기 저장 — 서버가 돌려준 방을 그대로 화면의 진실로 삼는다 */
  const saveDecor = useCallback(
    async (decor: Decor) => {
      if (!id) return;
      const next = await apiPatch<RoomView>(
        `/api/game/room/${id}`,
        { decor },
        { headers: ownerHeaders(token), fallback: "꾸미기를 저장하지 못했어요." },
      );
      setRoomView(next);
      return next;
    },
    [id, token],
  );

  const rename = useCallback(
    async (nickname: string) => {
      if (!id) return;
      setRoomView(
        await apiPatch<RoomView>(
          `/api/game/room/${id}`,
          { nickname },
          { headers: ownerHeaders(token), fallback: "이름을 바꾸지 못했어요." },
        ),
      );
    },
    [id, token],
  );

  const buy = useCallback(
    async (itemId: string) => {
      if (!id) return;
      const got = await apiPost<{ points: number; owned: string[] }>(
        `/api/game/room/${id}/buy`,
        { itemId },
        { headers: ownerHeaders(token), fallback: "아이템을 사지 못했어요." },
      );
      setRoomView((r) => (r ? { ...r, points: got.points, owned: got.owned } : r));
      return got;
    },
    [id, token],
  );

  const claim = useCallback(async (): Promise<RewardResult | null> => {
    if (!id) return null;
    const got = await apiPost<RewardResult>(
      `/api/game/room/${id}/reward`,
      {},
      { headers: ownerHeaders(token), fallback: "출석 보상을 받지 못했어요." },
    );
    setRoomView((r) => (r ? { ...r, points: got.points, claimedToday: true } : r));
    return got;
  }, [id, token]);

  const hideEntry = useCallback(
    async (entryId: string) => {
      if (!id) return;
      await apiDelete(`/api/game/room/${id}/guestbook?entry=${entryId}`, {
        headers: ownerHeaders(token),
        fallback: "글을 지우지 못했어요.",
      });
    },
    [id, token],
  );

  return {
    /** 하이드레이션 전 = 아직 모름 */
    ready: mounted,
    hasRoom: mounted && !!id,
    id,
    token,
    room,
    loading,
    error,
    create,
    saveDecor,
    rename,
    buy,
    claim,
    hideEntry,
    reload: load,
    forget: clear,
  };
}
