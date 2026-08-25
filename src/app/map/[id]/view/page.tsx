"use client";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useNav } from "@/hooks/useNav";
import { useMapStore } from "@/store/useMapStore";
import { useViewingStore } from "@/store/useViewingStore";
import { apiGet } from "@/lib/http";
import { forgetJoined, touchJoined } from "@/lib/map/visitor";
import { visitorId } from "@/lib/visitor";
import TopBar from "@/components/TopBar";
import MapBoard from "@/components/map/MapBoard";
import { MapSkeleton } from "@/components/Skeleton";
import type { MapView } from "@/lib/map/types";

/**
 * 이름을 올린 사람이 보는 남의 지도 — 읽기 전용.
 *
 * 자기 정보를 올린 사람만 열 수 있다(방문자 토큰으로 확인). 링크만 주운 사람은
 * 열리지 않는다 — 참여자 명단이 단톡방에 그대로 퍼지는 걸 막기 위해서다.
 * 내 별은 목록에서 '나' 로 표시해 이 사람들 사이 어디쯤인지 바로 보이게 한다.
 */
export default function MapViewPage() {
  const nav = useNav();
  const params = useParams<{ id: string }>();
  const id = params.id;
  const myMapId = useMapStore((s) => s.id);
  const setViewing = useViewingStore((s) => s.setViewing);

  const [map, setMap] = useState<MapView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const got = await apiGet<MapView>(`/api/map/${id}?visitor=${visitorId() ?? ""}`);
      setMap(got);
      // 남의 지도일 때만 메뉴에 알린다 — 내 지도를 이 주소로 연 것일 수도 있다
      if (got.role !== "owner") {
        setViewing(id, got.owner.name);
        touchJoined(id, got.owner.name); // 다녀왔으니 메뉴 맨 위로
      }
    } catch (e) {
      // 만료돼 사라진 지도라면 메뉴에서도 빼둔다. 열리지 않는 줄을 남겨둘 이유가 없다
      if (e instanceof Error && /찾을 수 없/.test(e.message)) forgetJoined(id);
      setError(e instanceof Error ? e.message : "지도를 불러오지 못했어요.");
    }
  }, [id, setViewing]);

  useEffect(() => {
    load();
  }, [load]);

  if (error) {
    return (
      <section className="screen">
        <TopBar back home menu />
        <div className="scroll">
          <div className="map-empty">
            <p>{error}</p>
            <button className="btn primary focusable" onClick={() => nav.push(`/map/${id}`)}>
              내 정보 올리러 가기
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="screen">
      <TopBar back home menu />
      <div className="scroll">
        {!map ? (
          <MapSkeleton />
        ) : (
          <div className="map-screen">
            <div className="map-card">
              <h2 className="join-title">🌟 {map.owner.name}님의 귀인지도</h2>
              <p className="join-desc">
                {map.owner.name}님을 가운데 두고 그린 지도예요. 별의 자리와 밝기는
                {map.owner.name}님과의 케미고, 내 별은 목록에서 <b>나</b>로 표시돼요.
              </p>
            </div>

            <MapBoard
              map={map}
              openId={open}
              onToggle={(mid) => setOpen((v) => (v === mid ? null : mid))}
              empty={
                <div className="map-empty">
                  <p>아직 아무도 없어요.</p>
                </div>
              }
            />

            <button
              className="btn primary block focusable"
              onClick={() => nav.push("/map")}
            >
              {myMapId ? "내 귀인지도 보기" : "나도 내 귀인지도 그리기"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
