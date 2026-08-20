"use client";
import { ROLES } from "@/lib/saju/chemi";
import StarMap from "./StarMap";
import ChemiList from "./ChemiList";
import type { MapMember, MapView } from "@/lib/map/types";

interface Props {
  map: MapView;
  openId: string | null;
  onToggle: (id: string) => void;
  /** 주인일 때만 — 없으면 읽기 전용 */
  onRemove?: (m: MapMember) => void;
  /** 제목 줄 오른쪽에 붙일 것(새로고침 등) */
  headExtra?: React.ReactNode;
  /** 아무도 없을 때 보여줄 것 */
  empty?: React.ReactNode;
}

/**
 * 지도 두 칸 — 별지도와 케미 나래비.
 *
 * 주인이 보는 화면(`/map`)과 이름을 올린 사람이 보는 화면(`/map/[id]/view`)이
 * 같은 그림을 봐야 해서 한 군데로 모았다. 다른 건 고칠 수 있느냐뿐이다.
 */
export default function MapBoard({ map, openId, onToggle, onRemove, headExtra, empty }: Props) {
  return (
    <>
      <div className="map-card">
        <div className="map-head">
          <h2>관계 지도</h2>
          <span>· {map.members.length}명</span>
          {headExtra}
        </div>

        <StarMap
          owner={map.owner}
          members={map.members}
          selected={openId}
          onSelect={onToggle}
        />

        <div className="role-tiles">
          {ROLES.map((r) => (
            <div className="role-tile" key={r.key}>
              <b style={{ color: r.color }}>
                {map.members.filter((m) => m.role === r.key).length}
              </b>
              <span>{r.emoji} {r.label}</span>
            </div>
          ))}
        </div>
      </div>

      {map.members.length === 0 ? (
        empty
      ) : (
        <div className="map-card">
          <div className="map-head">
            <h2>케미 나래비</h2>
            <span>· 잘 맞는 순</span>
          </div>
          <p className="join-desc">이름을 누르면 조심할 점도 볼 수 있어요</p>
          <ChemiList
            members={map.members}
            openId={openId}
            onToggle={onToggle}
            onRemove={onRemove}
            mineId={map.mine}
          />
        </div>
      )}
    </>
  );
}
