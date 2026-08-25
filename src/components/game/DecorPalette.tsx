"use client";
import { useState } from "react";
import {
  DEFAULT_ITEM,
  itemsOfSlot,
  SLOT_KEYS,
  SLOT_LABEL,
  type Decor,
  type DecorItem,
  type SlotKey,
} from "@/lib/game/items";

/*
 * 꾸미기 팔레트 — 슬롯을 고르고, 그 슬롯의 아이템을 고른다.
 *
 * 칩은 실제 조각을 그리지 않고 CSS 그라디언트(`item.swatch`)로 대신한다.
 * 아이템 하나하나를 진짜 SVG 로 미리 그리면 한 화면에 스무 개 넘는 필터가 깔려
 * 저가 기기에서 눈에 띄게 버벅인다. 고른 결과는 바로 위 무대에 즉시 반영되므로,
 * 칩은 "어떤 색 계열인지" 만 알려주면 된다.
 *
 * 못 산 아이템도 눌리게 둔다 — 눌러야 값을 보고 살지 말지 정할 수 있다.
 * 대신 칩을 흐리게 해서 아직 내 것이 아님을 표시한다.
 */

interface Props {
  decor: Decor;
  owned: string[];
  points: number;
  /** 이 아이템으로 갈아 끼운다 */
  onPick: (slot: SlotKey, itemId: string) => void;
  /** 값을 치르고 산다. 성공하면 그대로 갈아 끼운다 */
  onBuy: (item: DecorItem) => Promise<void>;
  busy?: boolean;
}

export default function DecorPalette({ decor, owned, points, onPick, onBuy, busy }: Props) {
  const [slot, setSlot] = useState<SlotKey>("wall");
  const [asking, setAsking] = useState<DecorItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  const current = decor[slot] ?? DEFAULT_ITEM[slot];
  const has = (item: DecorItem) => item.price === 0 || owned.includes(item.id);

  const choose = (item: DecorItem) => {
    setError(null);
    if (has(item)) return onPick(slot, item.id);
    setAsking(item); // 값을 치르기 전에 한 번 묻는다 — 되돌릴 수 없는 소비라서
  };

  const confirmBuy = async () => {
    if (!asking) return;
    try {
      await onBuy(asking);
      onPick(asking.slot, asking.id);
      setAsking(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "아이템을 사지 못했어요.");
    }
  };

  return (
    <div className="decor">
      <div className="decor-tabs" role="tablist" aria-label="꾸밀 곳">
        {SLOT_KEYS.map((k) => (
          <button
            key={k}
            role="tab"
            aria-selected={k === slot}
            className={`decor-tab focusable ${k === slot ? "on" : ""}`}
            onClick={() => {
              setSlot(k);
              setAsking(null);
            }}
          >
            {SLOT_LABEL[k]}
          </button>
        ))}
      </div>

      <div className="decor-grid" style={{ marginTop: 12 }}>
        {itemsOfSlot(slot).map((item) => {
          const mine = has(item);
          return (
            <button
              key={item.id}
              className={`decor-item focusable ${item.id === current ? "on" : ""} ${
                mine ? "" : "locked"
              }`}
              onClick={() => choose(item)}
              disabled={busy}
              aria-pressed={item.id === current}
            >
              <span className="chip" style={{ background: item.swatch }} aria-hidden />
              <span className="k">{item.name}</span>
              <span className={`p ${mine ? "own" : ""}`}>
                {mine ? (item.id === current ? "사용 중" : "보유") : `${item.price}P`}
              </span>
            </button>
          );
        })}
      </div>

      {error && <p className="room-err" style={{ marginTop: 10 }}>{error}</p>}

      {asking && (
        <div className="modal-scrim" onClick={() => setAsking(null)}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label="아이템 구매"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="m-ic" aria-hidden>
              🛍️
            </div>
            <p className="m-title">
              <b>{asking.name}</b>
              <br />
              {asking.price}P 로 살까요?
            </p>
            <p className="m-sub">
              지금 가진 포인트 {points}P
              {points < asking.price && " — 조금 모자라요"}
            </p>
            <div className="m-actions">
              <button className="btn ghost focusable" onClick={() => setAsking(null)}>
                다음에
              </button>
              <button
                className="btn primary focusable"
                onClick={confirmBuy}
                disabled={busy || points < asking.price}
              >
                {busy ? "사는 중…" : "살게요"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
