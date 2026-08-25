"use client";
import { useEffect, useState } from "react";
import TopBar from "@/components/TopBar";
import { RoomSkeletonScreen } from "@/components/Skeleton";
import { useMyRoom } from "@/hooks/useMyRoom";
import { useNav } from "@/hooks/useNav";
import type { ElementKey } from "@/lib/game/elements";
import type { Decor, DecorItem, SlotKey } from "@/lib/game/items";
import { DEFAULT_ITEM } from "@/lib/game/items";
import DecorPalette from "./DecorPalette";
import RoomStage from "./RoomStage";

/*
 * 꾸미기 모드.
 *
 * 고르는 순간 위쪽 무대가 바로 바뀌고, 저장은 따로 누른다. 매번 서버에 쓰면
 * 스무 번 만지작거리는 동안 스무 번 왕복하는 데다, 마음에 안 들어 되돌릴 때
 * 되돌릴 것이 없다. 대신 저장하지 않고 나가려 하면 한 번 붙잡는다.
 *
 * **구매는 즉시 서버로 간다.** 포인트가 오가는 일이라 화면 상태로 들고 있으면
 * 안 된다 — 저장을 안 누르고 나가면 산 것이 사라지거나, 반대로 두 번 사질 수 있다.
 */

interface Props {
  roomMarkup: string;
  characterMarkups: Record<ElementKey, string>;
}

export default function Decorator({ roomMarkup, characterMarkups }: Props) {
  const nav = useNav();
  const { ready, hasRoom, room, saveDecor, buy, reload } = useMyRoom();

  const [draft, setDraft] = useState<Decor | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 서버에서 방이 오면 그 상태에서 시작한다(한 번만 — 이후 손댄 값을 덮지 않게)
  useEffect(() => {
    if (room && draft === null) setDraft(room.decor);
  }, [room, draft]);

  // 방이 없는 사람이 주소로 바로 들어온 경우 — 만드는 화면이 할 말을 다 한다
  useEffect(() => {
    if (ready && !hasRoom) nav.replace("/my-room");
  }, [ready, hasRoom, nav]);

  if (!ready || !hasRoom || !room || draft === null) return <RoomSkeletonScreen />;

  const dirty = JSON.stringify(draft) !== JSON.stringify(room.decor);

  const pick = (slot: SlotKey, itemId: string) => {
    setError(null);
    setDraft((d) => {
      const next = { ...(d ?? {}) };
      // 기본값은 아예 담지 않는다 — 저장본이 짧아지고 기본 에셋이 바뀌어도 따라간다
      if (itemId === DEFAULT_ITEM[slot]) delete next[slot];
      else next[slot] = itemId;
      return next;
    });
  };

  const purchase = async (item: DecorItem) => {
    setBusy(true);
    try {
      await buy(item.id);
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      await saveDecor(draft);
      nav.push("/my-room");
    } catch (e) {
      setError(e instanceof Error ? e.message : "꾸미기를 저장하지 못했어요.");
      setBusy(false);
    }
  };

  const cancel = () => {
    if (dirty && !window.confirm("저장하지 않은 꾸미기가 있어요. 그냥 나갈까요?")) return;
    nav.push("/my-room");
  };

  return (
    <section className="screen">
      <TopBar home menu />
      <div className="scroll">
        <div className="room-screen">
          <div className="room-head">
            <h1 className="room-title">🎨 방 꾸미기</h1>
            <span className="point-badge" style={{ position: "static" }}>
              <span className="ic" aria-hidden>
                ✨
              </span>
              {(room.points ?? 0).toLocaleString()}P
            </span>
          </div>

          <RoomStage
            element={room.element}
            roomMarkup={roomMarkup}
            characterMarkup={characterMarkups[room.element]}
            decor={draft}
          />

          <DecorPalette
            decor={draft}
            owned={room.owned ?? []}
            points={room.points ?? 0}
            onPick={pick}
            onBuy={purchase}
            busy={busy}
          />

          {error && (
            <p className="room-err">
              {error}{" "}
              <button className="link-btn focusable" onClick={reload}>
                다시 불러오기
              </button>
            </p>
          )}

          <div className="decor-bar">
            <button className="btn ghost focusable" onClick={cancel} disabled={busy}>
              그만두기
            </button>
            <button
              className="btn primary focusable"
              onClick={save}
              disabled={busy || !dirty}
            >
              {busy ? "저장 중…" : dirty ? "저장하기" : "저장됨"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
