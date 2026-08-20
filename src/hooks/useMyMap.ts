"use client";
import { useCallback, useEffect, useState } from "react";
import { useMapStore } from "@/store/useMapStore";
import { plantSaju } from "@/lib/map/plant";
import type { JoinInput, MapView } from "@/lib/map/types";

async function ask<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { cache: "no-store", ...init });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((body as { message?: string }).message ?? "요청에 실패했어요.");
  return body as T;
}

/**
 * 내 귀인지도 한 장을 다루는 훅 — 만들기·불러오기·지우기.
 *
 * 지도는 서버에 있으므로 화면이 뜰 때마다 새로 받아온다. 링크를 받은 친구가
 * 방금 이름을 올렸다면 그게 바로 보여야 하기 때문이다.
 */
export function useMyMap() {
  const { id, key, setMap, clear } = useMapStore();
  const [mounted, setMounted] = useState(false);
  const [map, setMapView] = useState<MapView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => setMounted(true), []); // localStorage 하이드레이션 대기

  const load = useCallback(async () => {
    if (!id || !key) return;
    setLoading(true);
    setError(null);
    try {
      setMapView(await ask<MapView>(`/api/map/${id}?key=${key}`));
    } catch (e) {
      // 만료·삭제된 지도를 붙들고 있으면 영영 빈 화면이라 주소록을 비운다
      if (e instanceof Error && /찾을 수 없/.test(e.message)) clear();
      setError(e instanceof Error ? e.message : "지도를 불러오지 못했어요.");
    } finally {
      setLoading(false);
    }
  }, [id, key, clear]);

  useEffect(() => {
    if (mounted) load();
  }, [mounted, load]);

  /*
   * 화면으로 돌아올 때 다시 받아온다.
   *
   * 지도를 띄워둔 채 링크를 보내고 답을 기다리는 게 이 화면의 기본 사용법이다.
   * 그동안 화면은 처음 받아온 상태 그대로라, 친구가 방금 올린 별이 안 뜬다.
   * 탭을 옮겼다 오거나 앱을 다시 열면 그 순간이 곧 "확인하러 온 순간"이다.
   */
  useEffect(() => {
    if (!mounted) return;
    const onWake = () => {
      if (document.visibilityState === "visible") load();
    };
    document.addEventListener("visibilitychange", onWake);
    window.addEventListener("focus", onWake);
    return () => {
      document.removeEventListener("visibilitychange", onWake);
      window.removeEventListener("focus", onWake);
    };
  }, [mounted, load]);

  const create = useCallback(
    async (input: JoinInput) => {
      const got = await ask<{ id: string; key: string; solar: string }>("/api/map", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      setMap(got.id, got.key);
      // 여기서 넣은 정보로 운세·사주도 볼 수 있게 사주 자리에 옮겨 심는다
      plantSaju(input, got.solar);
      return got;
    },
    [setMap],
  );

  const remove = useCallback(
    async (memberId: string) => {
      if (!id || !key) return;
      // 지도를 다시 받아오는 대신 화면에서 먼저 지운다 — 목록이 길어도 끊기지 않게
      setMapView((m) => (m ? { ...m, members: m.members.filter((x) => x.id !== memberId) } : m));
      try {
        await ask(`/api/map/${id}?key=${key}&member=${memberId}`, { method: "DELETE" });
      } catch {
        await load(); // 실패하면 서버 쪽이 맞다
      }
    },
    [id, key, load],
  );

  return {
    /** 하이드레이션 전 = 아직 모름 */
    ready: mounted,
    hasMap: mounted && !!id && !!key,
    id,
    map,
    loading,
    error,
    create,
    reload: load,
    remove,
    forget: clear,
  };
}
