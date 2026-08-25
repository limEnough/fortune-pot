"use client";
import {
  C,
  CARD_W,
  ensureFonts,
  f,
  fd,
  newCanvas,
  nightSky,
  pill,
  rrPath,
  seedOf,
  svgImage,
  txt,
} from "@/lib/share/draw";
import { ELEMENTS, type ElementKey } from "./elements";
import { CHAR_VIEWBOX, placeCharacter, ROOM, type RoomSpec } from "./layout";

/*
 * 방을 이미지로 굽는다.
 *
 * 사주·운세 카드는 Canvas 2D 로 직접 그리지만(화면과 레이아웃이 아예 다르다),
 * 방은 **화면에 보이는 그대로**가 결과여야 한다. 그래서 방과 캐릭터를 정지한
 * SVG 한 장으로 합쳐 브라우저의 SVG 래스터라이저에 맡긴다.
 *
 * html2canvas / html-to-image 를 쓰지 않는 이유도 같다 — 우리 에셋은 feTurbulence,
 * feGaussianBlur 같은 필터로 짜여 있는데 그 계열 라이브러리가 자주 깨뜨린다.
 * 에셋에 외부 참조(폰트·이미지·CSS)가 없어서 data: URL 로 만들어도 캔버스가
 * 오염되지 않고, 그대로 PNG 로 떨어진다.
 *
 * 글자는 SVG 안에 넣지 않는다. SVG 이미지 안에서는 웹폰트가 로드되지 않아
 * 별명이 폴백 글꼴로 나온다. 방을 구운 다음 캔버스 위에 직접 그린다.
 */

export interface SceneOptions {
  room?: RoomSpec;
  /** loadRoomSvg() 결과에 꾸미기를 반영한 마크업 — 화면에 쓴 것과 같아야 한다 */
  roomMarkup: string;
  characterMarkup: string;
}

/** 루트 `<svg>` 의 속성을 덮어쓴다. class 처럼 안쪽 CSS 가 기대는 속성은 남긴다. */
function reattr(markup: string, attrs: Record<string, string | number>): string {
  const open = /^<svg([^>]*)>/.exec(markup.trim());
  if (!open) return markup;

  const kept = open[1]
    // 우리가 다시 지정할 것들만 걷어낸다
    .replace(/\s(?:width|height|viewBox|x|y|xmlns)="[^"]*"/g, "")
    .trim();
  const next = Object.entries(attrs)
    .map(([k, v]) => `${k}="${v}"`)
    .join(" ");
  return markup.trim().replace(/^<svg[^>]*>/, `<svg xmlns="http://www.w3.org/2000/svg" ${next} ${kept}>`);
}

/** 방 + 캐릭터를 정지한 SVG 한 장으로 합친다 */
export function composeSceneSvg(options: SceneOptions): string {
  const room = options.room ?? ROOM;
  const place = placeCharacter(room);

  const roomLayer = reattr(options.roomMarkup, {
    viewBox: `0 0 ${room.width} ${room.height}`,
    width: room.width,
    height: room.height,
  });

  // 캐릭터는 중첩 <svg> 로 얹는다 — 자체 viewBox 가 있어 배율이 저절로 맞는다
  const charLayer = reattr(options.characterMarkup, {
    x: place.raw.x.toFixed(2),
    y: place.raw.y.toFixed(2),
    width: place.raw.width.toFixed(2),
    height: place.raw.height.toFixed(2),
    viewBox: `${CHAR_VIEWBOX.x} ${CHAR_VIEWBOX.y} ${CHAR_VIEWBOX.width} ${CHAR_VIEWBOX.height}`,
  });

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${room.width}" height="${room.height}"`,
    ` viewBox="0 0 ${room.width} ${room.height}">`,
    // 정지 컷 — 모든 애니메이션을 0% 프레임에 묶는다. 안 그러면 구울 때마다 달라진다
    "<style>*{animation:none!important}</style>",
    roomLayer,
    charLayer,
    "</svg>",
  ].join("");
}

export interface RoomCardOptions extends SceneOptions {
  element: ElementKey;
  nickname: string | null;
  /** 공유 카드 하단에 넣을 주소 (예: fortunepot.app/room/abc) */
  shareUrl?: string;
}

const PAD = 48;
const ROOM_W = CARD_W - PAD * 2; // 984
const HEAD_H = 168;
const FOOT_H = 116;

/**
 * 공유용 카드 한 장.
 * 위에 이름, 가운데 방, 아래 주소. 배경은 앱 화면과 같은 밤하늘이다.
 */
export async function renderRoomCard(options: RoomCardOptions): Promise<HTMLCanvasElement> {
  const room = options.room ?? ROOM;
  const roomH = Math.round((ROOM_W * room.height) / room.width);
  const height = HEAD_H + roomH + FOOT_H;

  const meta = ELEMENTS[options.element];
  const who = options.nickname ? `${options.nickname}님의 방` : "포춘팟 내 방";
  const badge = `${meta.ohaeng}(${meta.hanja}) · ${meta.name}`;

  // 카드에 들어갈 글자의 폰트 조각을 먼저 받아둔다(fonts.css 가 unicode-range 로 쪼개져 있다)
  const [scene] = await Promise.all([
    svgImage(composeSceneSvg(options), ROOM_W, roomH),
    ensureFonts(`${who}${badge}${options.shareUrl ?? ""}포춘팟에서 내 사주 캐릭터 만나기`),
  ]);

  const canvas = newCanvas(CARD_W, height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D 캔버스를 만들 수 없어요");

  nightSky(ctx, CARD_W, height, seedOf(who));

  txt(ctx, who, CARD_W / 2, 84, { font: fd(54), color: C.cream, align: "center" });
  pill(ctx, badge, CARD_W / 2, 106, {
    font: f(26, 700),
    color: meta.color,
    bg: "rgba(255,255,255,.08)",
    padX: 26,
    h: 46,
  });

  // 방은 화면과 같은 둥근 모서리로 잘라 얹는다
  ctx.save();
  rrPath(ctx, PAD, HEAD_H, ROOM_W, roomH, 28);
  ctx.clip();
  ctx.drawImage(scene, PAD, HEAD_H, ROOM_W, roomH);
  ctx.restore();
  rrPath(ctx, PAD, HEAD_H, ROOM_W, roomH, 28);
  ctx.strokeStyle = C.line;
  ctx.lineWidth = 2;
  ctx.stroke();

  const footY = HEAD_H + roomH;
  txt(ctx, "포춘팟에서 내 사주 캐릭터 만나기", CARD_W / 2, footY + 52, {
    font: f(26),
    color: C.textSoft,
    align: "center",
  });
  if (options.shareUrl) {
    txt(ctx, options.shareUrl, CARD_W / 2, footY + 88, {
      font: f(23),
      color: C.muted,
      align: "center",
    });
  }

  return canvas;
}
