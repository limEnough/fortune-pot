/*
 * 방 안에 캐릭터를 세우는 좌표 계산.
 *
 * 캐릭터 SVG 규격(5종 공통)
 *   viewBox = "0 -160 320 520"   ← 위쪽 160px 은 점프 정점을 담는 투명 여백
 *   접지선(발바닥) y = 344, 가로 중심 x = 160
 *
 * 방 SVG 의 `#slot-character` 가 `data-anchor-x` · `data-anchor-baseline` 을 들고
 * 있는데, 그 값을 여기에 한 번 더 적어 둔다. 배치는 서버 렌더·화면·이미지 굽기가
 * 모두 같은 값을 써야 하고, DOM 을 읽는 방식은 이미지 쪽에서 쓸 수 없어서다.
 */

export const CHAR_VIEWBOX = {
  x: 0,
  y: -160,
  width: 320,
  height: 520,
  centerX: 160,
  baselineY: 344,
} as const;

/** 캐릭터 SVG 위쪽 끝에서 접지선까지 */
const BASELINE_OFFSET = CHAR_VIEWBOX.baselineY - CHAR_VIEWBOX.y; // 504

export type RoomKey = "front" | "iso";

export interface RoomSpec {
  key: RoomKey;
  label: string;
  width: number;
  height: number;
  anchorX: number;
  anchorBaseline: number;
  /** 방 좌표계에서 캐릭터를 몇 px 폭으로 세울지 */
  charWidth: number;
}

export const ROOMS: Record<RoomKey, RoomSpec> = {
  front: {
    key: "front",
    label: "A · 정면형",
    width: 900,
    height: 640,
    anchorX: 450,
    anchorBaseline: 578,
    charWidth: 200,
  },
  iso: {
    key: "iso",
    label: "B · 아이소메트릭",
    width: 900,
    height: 700,
    anchorX: 440,
    anchorBaseline: 502,
    charWidth: 190,
  },
};

/** 실제로 쓰는 방 — 아이템 에셋을 한 벌만 그리면 되고 캡처 구도가 안정적이다 */
export const ROOM: RoomSpec = ROOMS.front;

export interface CharPlacement {
  /** 방 좌표계 값 — 이미지로 구울 때 쓴다 */
  raw: { x: number; y: number; width: number; height: number; scale: number };
  /** % 값 — DOM 오버레이 배치에 쓴다 */
  css: { left: string; top: string; width: string };
}

export function placeCharacter(
  room: RoomSpec,
  options: { charWidth?: number; offsetX?: number; offsetY?: number } = {},
): CharPlacement {
  const charWidth = options.charWidth ?? room.charWidth;
  const scale = charWidth / CHAR_VIEWBOX.width;

  const x = room.anchorX - CHAR_VIEWBOX.centerX * scale + (options.offsetX ?? 0);
  const y = room.anchorBaseline - BASELINE_OFFSET * scale + (options.offsetY ?? 0);

  return {
    raw: { x, y, width: charWidth, height: CHAR_VIEWBOX.height * scale, scale },
    css: {
      left: `${(x / room.width) * 100}%`,
      top: `${(y / room.height) * 100}%`,
      width: `${(charWidth / room.width) * 100}%`,
    },
  };
}
