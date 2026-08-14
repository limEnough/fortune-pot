"use client";
import { useState } from "react";
import { useMyMap } from "@/hooks/useMyMap";
import { useSaju } from "@/hooks/useSaju";
import TopBar from "@/components/TopBar";
import JoinForm from "@/components/map/JoinForm";
import StarMap from "@/components/map/StarMap";
import ChemiList from "@/components/map/ChemiList";
import ShareBar from "@/components/map/ShareBar";
import { MapSkeleton } from "@/components/Skeleton";
import { ROLES } from "@/lib/saju/chemi";
import type { MapMember } from "@/lib/map/types";

/**
 * 내 귀인지도.
 *
 * 지도 자체는 서버(KV)에 있고 브라우저에는 id·열쇠만 남는다. 그래서 이 화면은
 * 들어올 때마다 새로 받아온다 — 링크를 받은 친구가 방금 올린 이름이 바로 떠야 한다.
 */
export default function MapPage() {
  const { ready, hasMap, id, map, loading, error, create, reload, remove } = useMyMap();
  const { saju } = useSaju();
  const [open, setOpen] = useState<string | null>(null);
  const [bubbleOff, setBubbleOff] = useState(false);

  const startWithSaju = async () => {
    if (!saju) return;
    await create({ name: saju.name, birth: saju.birth, cal: "solar" });
  };

  const dropMember = async (m: MapMember) => {
    if (!window.confirm(`${m.name}님을 지도에서 지울까요?`)) return;
    setOpen(null);
    await remove(m.id);
  };

  if (!ready) {
    return (
      <section className="screen">
        <TopBar back home menu />
        <div className="scroll"><MapSkeleton /></div>
      </section>
    );
  }

  /* 아직 지도가 없다 — 생년월일 한 번으로 시작한다 */
  if (!hasMap) {
    return (
      <section className="screen">
        <TopBar back home menu />
        <div className="scroll">
          {saju && !bubbleOff && (
            <div className="recent-bubble" role="dialog" aria-label="최근 사주로 지도 만들기">
              <p>
                최근 조회한 <b style={{ color: "var(--magic)" }}>{saju.name}</b>님으로
                지도를 만들까요?
              </p>
              <div className="bubble-actions">
                <button className="bubble-btn ghost focusable" onClick={() => setBubbleOff(true)}>
                  아니요
                </button>
                <button className="bubble-btn primary focusable" onClick={startWithSaju}>
                  네
                </button>
              </div>
            </div>
          )}

          <JoinForm
            title={<>🌟 내 귀인지도 그리기</>}
            desc={
              <>
                생일만 넣으면 바로 나와요. 링크를 보내면 친구가 자기 생일을 넣고
                내 지도에 별로 올라와요.
              </>
            }
            submitLabel="내 지도 만들기"
            onSubmit={async (input) => {
              await create(input);
            }}
          />

          <p className="map-note">
            지도에는 이름과 유형만 보여요. 생년월일은 궁합을 계산할 때만 쓰이고
            다른 사람에게 보이지 않아요.
          </p>
        </div>
      </section>
    );
  }

  /* 지도가 있다 */
  return (
    <section className="screen">
      <TopBar back home menu />
      <div className="scroll">
        {loading && !map && <MapSkeleton />}

        {error && !map && (
          <div className="map-empty">
            <p>{error}</p>
            <button className="btn ghost focusable" onClick={reload}>다시 시도</button>
          </div>
        )}

        {map && (
          <div className="map-screen">
            <div className="map-card">
              <h2 className="join-title">🔗 친구를 지도에 초대하기</h2>
              <p className="join-desc">
                이 링크를 받은 사람이 생일을 넣으면 <b>{map.owner.name}</b>님 지도에
                별로 올라와요.
              </p>
              {id && <ShareBar id={id} ownerName={map.owner.name} />}
            </div>

            <div className="map-card">
              <div className="map-head">
                <h2>관계 지도</h2>
                <span>· {map.members.length}명</span>
                <button className="link-btn refresh focusable" onClick={reload} disabled={loading}>
                  {loading ? "새로고침 중…" : "새로고침"}
                </button>
              </div>

              <StarMap
                owner={map.owner}
                members={map.members}
                selected={open}
                onSelect={(mid) => setOpen((v) => (v === mid ? null : mid))}
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
              <div className="map-empty">
                <p>
                  아직 아무도 없어요.<br />
                  링크를 보내 첫 별을 받아보세요.<br />
                  <small>방금 친구가 올렸다면 아래를 눌러주세요</small>
                </p>
                <button className="btn ghost focusable" onClick={reload} disabled={loading}>
                  {loading ? "확인 중…" : "새로 온 별 확인하기"}
                </button>
              </div>
            ) : (
              <div className="map-card">
                <div className="map-head">
                  <h2>케미 나래비</h2>
                  <span>· 잘 맞는 순</span>
                </div>
                <p className="join-desc">이름을 누르면 조심할 점도 볼 수 있어요</p>
                <ChemiList
                  members={map.members}
                  openId={open}
                  onToggle={(mid) => setOpen((v) => (v === mid ? null : mid))}
                  onRemove={dropMember}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
