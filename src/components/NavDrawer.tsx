"use client";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { useUIStore } from "@/store/useUIStore";
import { useMapStore } from "@/store/useMapStore";
import { useViewingStore } from "@/store/useViewingStore";
import { useRelease } from "@/hooks/useRelease";
import { useSaju } from "@/hooks/useSaju";
import { useNav } from "@/hooks/useNav";
import { listJoined, MAX_JOINED, type JoinedRef } from "@/lib/map/visitor";
import { isComplete } from "@/types/saju";

/** 그 자리이거나 그 아래인지 — 마디 단위로 본다(/map/abc 가 /map/abcdef 에 걸리지 않게) */
const under = (pathname: string, base: string) =>
  pathname === base || pathname.startsWith(`${base}/`);

const Chev = () => (
  <svg
    className="chev"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 6l6 6-6 6" />
  </svg>
);
const X = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
  >
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export default function NavDrawer() {
  const nav = useNav();
  const pathname = usePathname();
  const { drawerOpen, closeDrawer } = useUIStore();
  const { saju } = useSaju();
  const { hasUpdate, openNote } = useRelease();

  const myMapId = useMapStore((s) => s.id);
  const viewing = useViewingStore((s) => s.map);
  const [joined, setJoined] = useState<JoinedRef[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []); // localStorage 하이드레이션 대기

  /*
   * 이름을 올린 지도 목록은 드로어를 열 때마다 다시 읽는다.
   *
   * 드로어는 AppShell 에 늘 떠 있어 화면을 옮겨도 다시 mount 되지 않는다. 한 번만
   * 읽으면 방금 친구 지도에 이름을 올리고 메뉴를 연 사람에게 그 지도가 안 보인다.
   */
  useEffect(() => {
    if (drawerOpen) setJoined(listJoined());
  }, [drawerOpen]);

  /*
   * 아직 이름을 올리지 않은 지도는 저장된 게 없어 목록에 없다. 그 화면에 있는
   * 동안만 목록 맨 앞에 얹어 "여기가 어디인지" 를 알린다 — 경로가 그 지도를
   * 벗어나면 아래 조건이 깨지면서 저절로 사라진다.
   */
  const onViewing = !!viewing && under(pathname, `/map/${viewing.id}`);

  const shared = useMemo(() => {
    if (!onViewing || !viewing) return joined;
    const rest = joined.filter((j) => j.id !== viewing.id);
    // 저장해 둔 이름이 있으면 그쪽을 쓴다 — 올릴 때 받아 둔 값이라 더 확실하다
    const owner = joined.find((j) => j.id === viewing.id)?.owner ?? viewing.ownerName;
    // 아직 안 올린 지도가 얹히면 한 줄이 넘칠 수 있다. 보고 있는 쪽을 맨 앞에 세우고
    // 그때 밀려나는 건 가장 오래된 지도다
    return [{ id: viewing.id, owner }, ...rest].slice(0, MAX_JOINED);
  }, [joined, viewing, onViewing]);

  const go = (path: string) => {
    closeDrawer();
    nav.push(path);
  };

  // 드로어(z-index 51)가 릴리즈 시트(41)를 가리므로 먼저 닫는다
  const goNote = () => {
    closeDrawer();
    openNote();
  };

  /*
   * 어느 화면에서든 세 곳이 다 보인다.
   *
   * 예전엔 사주가 없으면 운세·사주 항목을 아예 숨겼다. 그래서 귀인지도만 하고 온
   * 사람의 메뉴에는 귀인지도 하나만 남았다. 지금은 늘 띄우고, 정보가 모자라면
   * 입력 폼을 거쳐 돌아오게 한다(성별만 비어 있으면 그 칸만 받는다).
   * 지금 보고 있는 화면은 눌리지 않는 표시로 남겨 위치를 알려준다.
   *
   * 어디에 있는지는 경로가 정확히 같을 때만 표시한다. 예전엔 /map 만 startsWith
   * 로 봤는데, 그러면 공유 링크(/map/{id})와 남의 지도(/map/{id}/view)까지 걸려
   * **자기 지도를 만들지도 않은 사람에게 "내 귀인지도 = 지금 화면"** 이 떴다.
   * 남의 지도는 아래 목록이 따로 맡는다 — 그쪽은 한 지도가 두 화면(이름 올리기와
   * 지도 보기)에 걸쳐 있어 match 로 묶는다.
   */
  const Item = ({ path, label, match }: { path: string; label: string; match?: string }) =>
    (match ? under(pathname, match) : pathname === path) ? (
      <div className="nav-item current" aria-current="page">
        {label}
        <span className="nav-here">지금 화면</span>
      </div>
    ) : (
      <button className="nav-item focusable" onClick={() => go(path)}>
        {label}
        <Chev />
      </button>
    );

  return (
    <>
      <div
        className={`drawer-scrim ${drawerOpen ? "show" : ""}`}
        onClick={closeDrawer}
      />
      <nav className={`drawer ${drawerOpen ? "show" : ""}`} aria-label="메뉴">
        <div className="d-top">
          <div className="who">
            {saju?.name ?? "게스트"}님
            <small>
              {!saju
                ? "사주 정보를 입력해 주세요"
                : isComplete(saju)
                  ? "오늘의 운세가 준비됐어요"
                  : "몇 칸만 더 채우면 운세도 볼 수 있어요"}
            </small>
          </div>
          <button
            className="x focusable"
            aria-label="닫기"
            onClick={closeDrawer}
          >
            <X />
          </button>
        </div>

        {/* 공유받은 지도가 쌓이면 목록이 길어진다 — 넘치는 만큼은 굴러가게 둔다 */}
        <div className="d-body">
          <div className="nav-group">
            <div className="g-lab">사주</div>
            <Item path="/fortune" label="오늘의 운세" />
            <Item path="/saju" label="나의 사주는" />
            {/*
              정보가 있으면 고치러(/info), 없으면 처음 넣으러(/infoinput) 간다.
              고치기는 저장한 뒤 보고 있던 화면으로 돌아온다 — 메뉴에서 들어온
              사람은 화면을 옮기려던 게 아니라 값을 고치려던 것이므로.
            */}
            <button
              className="nav-item focusable"
              onClick={() =>
                go(saju ? `/info?from=${encodeURIComponent(pathname)}` : "/infoinput")
              }
            >
              {saju ? "내 정보 수정하기" : "내 정보 입력하기"}
              <Chev />
            </button>
          </div>

          {/*
            지도가 없으면 이름부터 다르게 부른다. 누를 곳은 그대로 /map 이고,
            그 화면이 지도 유무를 보고 그리기 폼과 지도를 알아서 가른다.
          */}
          <div className="nav-group">
            <div className="g-lab">관계</div>
            <Item path="/map" label={mounted && myMapId ? "내 귀인지도" : "내 귀인지도 그리기"} />

            {shared.length > 0 && (
              <>
                <div className="g-sub">공유받은 귀인지도</div>
                <div className="nav-sub">
                  {shared.map((m) => (
                    <Item
                      key={m.id}
                      path={`/map/${m.id}/view`}
                      match={`/map/${m.id}`}
                      // 이 방식 이전에 올린 기록에는 주인 이름이 없다
                      label={`${m.owner ?? "누군가"}님의 귀인지도`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="nav-group">
            <div className="g-lab">소식</div>
            <button className="nav-item focusable" onClick={goNote}>
              업데이트 소식
              {hasUpdate && <span className="nav-new">NEW</span>}
              <Chev />
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}
