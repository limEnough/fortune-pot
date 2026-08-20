"use client";
import { useState } from "react";
import { useMyMap } from "@/hooks/useMyMap";
import { useSaju } from "@/hooks/useSaju";
import { useSessionStore } from "@/store/useSessionStore";
import TopBar from "@/components/TopBar";
import JoinForm from "@/components/map/JoinForm";
import MapBoard from "@/components/map/MapBoard";
import ShareBar from "@/components/map/ShareBar";
import { MapSkeleton, MapSkeletonScreen } from "@/components/Skeleton";
import type { JoinInput, MapMember } from "@/lib/map/types";

/** 지도를 처음 만드는 폼 — 최근 정보를 쓰지 않을 때만 나온다 */
function NewMapForm({ onCreate }: { onCreate: (i: JoinInput) => Promise<unknown> }) {
  return (
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
        await onCreate(input);
      }}
    />
  );
}

/**
 * 내 귀인지도.
 *
 * 지도 자체는 서버(KV)에 있고 브라우저에는 id·열쇠만 남는다. 그래서 이 화면은
 * 들어올 때마다 새로 받아온다 — 링크를 받은 친구가 방금 올린 이름이 바로 떠야 한다.
 */
export default function MapPage() {
  const { ready, hasMap, id, map, loading, error, create, reload, remove } = useMyMap();
  const { saju } = useSaju();
  const confirmed = useSessionStore((s) => s.confirmed);
  const [open, setOpen] = useState<string | null>(null);
  const [bubbleOff, setBubbleOff] = useState(false);
  const [other, setOther] = useState(false);
  const [busy, setBusy] = useState(false);
  const [createErr, setCreateErr] = useState<string | null>(null);

  const startWithSaju = async () => {
    if (!saju) return;
    setBusy(true);
    setCreateErr(null);
    try {
      await create({
        name: saju.name,
        birth: saju.birth, // 저장된 값은 늘 양력
        cal: "solar",
        hourIdx: saju.hourIdx,
      });
    } catch (e) {
      setCreateErr(e instanceof Error ? e.message : "잠시 후 다시 시도해 주세요.");
      setBusy(false);
    }
  };

  const dropMember = async (m: MapMember) => {
    if (!window.confirm(`${m.name}님을 지도에서 지울까요?`)) return;
    setOpen(null);
    await remove(m.id);
  };

  // loading.tsx 와 같은 마크업이라야 라우트 전환에서 넘어올 때 화면이 튀지 않는다
  if (!ready) return <MapSkeletonScreen />;

  /* 아직 지도가 없다 */
  if (!hasMap) {
    /*
     * 메인에서 "이 정보로 볼게요" 를 확인했다면 다시 묻지 않는다. 이미 이름·생일·
     * 시각·성별을 다 가지고 있으므로 버튼 하나면 된다. 지도를 만드는 건 서버에
     * 자리를 만들고 공유 링크가 생기는 일이라 자동으로는 하지 않는다.
     */
    if (confirmed && saju) {
      return (
        <section className="screen">
          <TopBar back home menu />
          <div className="scroll">
            <div className="join-card">
              <h2 className="join-title">🌟 내 귀인지도 그리기</h2>
              <p className="join-desc">
                <b>{saju.name}</b>님({saju.birth}) 정보로 지도를 만들어요. 링크를 보내면
                친구가 자기 생일을 넣고 내 지도에 별로 올라와요.
              </p>
              {createErr && <p className="join-err">{createErr}</p>}
              <button
                className="btn primary block focusable"
                disabled={busy}
                onClick={startWithSaju}
              >
                {busy ? "그리는 중…" : `${saju.name}님으로 지도 만들기`}
              </button>
              <button className="link-btn focusable" onClick={() => setOther(true)}>
                다른 정보로 만들기
              </button>
            </div>
            {other && <NewMapForm onCreate={create} />}
            <p className="map-note">
              지도에는 이름과 유형만 보여요. 생년월일은 궁합을 계산할 때만 쓰이고
              다른 사람에게 보이지 않아요.
            </p>
          </div>
        </section>
      );
    }

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

          <NewMapForm onCreate={create} />

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
                별로 올라와요. 이름을 올린 사람은 <b>이 지도를 볼 수 있어요</b>
                (이름과 유형까지, 생년월일은 아무에게도 보이지 않아요).
              </p>
              {id && <ShareBar id={id} ownerName={map.owner.name} />}
            </div>

            <MapBoard
              map={map}
              openId={open}
              onToggle={(mid) => setOpen((v) => (v === mid ? null : mid))}
              onRemove={dropMember}
              headExtra={
                <button className="link-btn refresh focusable" onClick={reload} disabled={loading}>
                  {loading ? "새로고침 중…" : "새로고침"}
                </button>
              }
              empty={
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
              }
            />
          </div>
        )}
      </div>
    </section>
  );
}
