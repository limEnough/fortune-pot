/*
 * 카드 이미지를 그리는 캔버스 유틸.
 *
 * html2canvas 류의 DOM 스냅샷 대신 Canvas 2D 로 직접 그린다.
 *  - 화면이 gradient / backdrop-filter / box-shadow 로 짜여 있어 스냅샷 계열이
 *    그대로 옮기지 못한다.
 *  - 접힘 패널·스크롤 위치 같은 화면 상태에 결과가 끌려다닌다.
 *  - 카드는 화면과 레이아웃이 아예 다르다(세로로 길고 여백이 넉넉한 인쇄물).
 * 좌표를 직접 잡으면 결과가 항상 같고, 의존성도 늘지 않는다.
 *
 * 좌표계는 가로 1080px 고정. 세로는 내용에 따라 정해지므로, 카드는
 *  1) 투명한 레이어에 내용을 그려 실제 높이를 재고
 *  2) 그 높이로 만든 캔버스에 배경 → 레이어 순으로 합성
 * 하는 두 단계를 거친다(`layered`).
 */

export const CARD_W = 1080;
export const PAD = 64;
export const CONTENT_W = CARD_W - PAD * 2;

/** globals.css 의 CSS 변수와 같은 값 — 화면과 카드가 같은 색을 쓴다 */
export const C = {
  bg0: "#0a0518",
  bg1: "#160b2e",
  bg2: "#2a1854",
  purple: "#8b5cf6",
  purpleD: "#6d3fd4",
  lilac: "#a78bfa",
  magic: "#e879f9",
  magicD: "#c026d3",
  cream: "#fdf3e3",
  gold: "#fcd34d",
  muted: "#b9a8e0",
  text: "#f3ecff",
  textSoft: "#e3d8ff",
  line: "rgba(167,139,250,.30)",
  lineSoft: "rgba(167,139,250,.18)",
  card: "rgba(255,255,255,.06)",
} as const;

const DISPLAY = '"Jua", "Jua Fallback", sans-serif';
const BODY = '"Noto Sans KR", "Noto Sans KR Fallback", sans-serif';

/** 본문(Noto Sans KR). 한자·기호까지 이 폰트가 받는다 */
export const f = (size: number, weight: 400 | 700 = 400) =>
  `${weight} ${size}px ${BODY}`;
/** 제목(Jua). 한자 글리프가 없으니 한글·숫자에만 쓴다 */
export const fd = (size: number) => `400 ${size}px ${DISPLAY}`;

/**
 * 캔버스가 쓸 글리프를 미리 받아둔다.
 *
 * fonts.css 는 unicode-range 로 300개 넘게 쪼개져 있어서, 화면에 아직 안 뜬
 * 글자의 슬라이스는 브라우저가 받지 않은 상태다. 그대로 그리면 폴백(Arial)로
 * 그려질 뿐 아니라 measureText 도 폴백 기준이라 줄바꿈까지 어긋난다.
 * load(font, text) 에 카드에 들어갈 문자열을 통째로 넘겨 필요한 슬라이스만 받는다.
 */
export async function ensureFonts(sample: string): Promise<void> {
  const fonts = document.fonts;
  if (!fonts) return;
  const text = sample + "0123456789.·,()%★☆-";
  await Promise.all(
    [`400 100px "Jua"`, `400 100px "Noto Sans KR"`, `700 100px "Noto Sans KR"`].map(
      (spec) => fonts.load(spec, text).catch(() => []),
    ),
  );
}

export function newCanvas(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

function ctxOf(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D 캔버스를 만들 수 없어요");
  return ctx;
}

/**
 * 내용 높이를 미리 알 수 없는 카드를 그린다.
 * `body` 는 투명 레이어에 그리고 마지막 y 좌표를 돌려주며, 그 높이로 만든
 * 캔버스에 `bg` 를 깐 뒤 레이어를 얹는다.
 */
export function layered(
  width: number,
  maxHeight: number,
  body: (ctx: CanvasRenderingContext2D) => number,
  bg: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
): HTMLCanvasElement {
  const layer = newCanvas(width, maxHeight);
  const height = Math.ceil(body(ctxOf(layer)));

  const out = newCanvas(width, height);
  const ctx = ctxOf(out);
  bg(ctx, width, height);
  ctx.drawImage(layer, 0, 0);
  return out;
}

/* ── 도형 ─────────────────────────────────────────────── */

export function rrPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

export interface BoxStyle {
  fill?: string | CanvasGradient;
  stroke?: string;
  lineWidth?: number;
  dash?: number[];
}

export function box(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  s: BoxStyle,
) {
  rrPath(ctx, x, y, w, h, r);
  if (s.fill) {
    ctx.fillStyle = s.fill;
    ctx.fill();
  }
  if (s.stroke) {
    ctx.save();
    if (s.dash) ctx.setLineDash(s.dash);
    ctx.strokeStyle = s.stroke;
    ctx.lineWidth = s.lineWidth ?? 2;
    ctx.stroke();
    ctx.restore();
  }
}

/** 카드 안에서 자주 쓰는 보라 그라데이션(.saju-card / .advice 와 같은 톤) */
export function magicFill(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
): CanvasGradient {
  const g = ctx.createLinearGradient(x, y, x + w, y + h);
  g.addColorStop(0, "rgba(139,92,246,.20)");
  g.addColorStop(1, "rgba(192,38,211,.12)");
  return g;
}

/* ── 글자 ─────────────────────────────────────────────── */

export interface TextOpts {
  font: string;
  color: string;
  align?: CanvasTextAlign;
}

export function txt(
  ctx: CanvasRenderingContext2D,
  s: string,
  x: number,
  y: number,
  o: TextOpts,
) {
  ctx.font = o.font;
  ctx.fillStyle = o.color;
  ctx.textAlign = o.align ?? "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(s, x, y);
}

/**
 * 폭에 맞춰 줄을 나눈다 — CSS 의 `word-break: keep-all` 과 같은 규칙.
 *
 * 브라우저 기본값은 한글을 음절 단위로 끊는다(UAX #14). 화면에선 폭이 좁아
 * 그게 낫지만, 카드는 줄이 길어서 "…부드러워져 / 요." 처럼 끝의 한두 글자만
 * 넘어가는 모양이 자주 나온다. 그래서 낱말(공백) 단위로 채우고, 낱말 하나가
 * 줄보다 길 때만 글자 단위로 쪼갠다.
 */
export function wrapLines(
  ctx: CanvasRenderingContext2D,
  s: string,
  maxW: number,
  font?: string,
): string[] {
  if (font) ctx.font = font;
  const fits = (t: string) => ctx.measureText(t).width <= maxW;
  const out: string[] = [];
  let line = "";

  const addWord = (w: string) => {
    const joined = line ? `${line} ${w}` : w;
    if (fits(joined)) {
      line = joined;
      return;
    }
    if (line) {
      out.push(line);
      line = "";
    }
    if (fits(w)) {
      line = w;
      return;
    }
    for (const ch of w) {
      if (line && !fits(line + ch)) {
        out.push(line);
        line = "";
      }
      line += ch;
    }
  };

  for (const para of s.split("\n")) {
    for (const w of para.split(" ")) if (w) addWord(w);
    out.push(line);
    line = "";
  }
  return out;
}

/** 첫 줄 baseline 을 y 로 받아, 마지막 줄 **다음** baseline 을 돌려준다 */
export function drawLines(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  x: number,
  y: number,
  lineH: number,
  o: TextOpts,
): number {
  lines.forEach((ln, i) => txt(ctx, ln, x, y + i * lineH, o));
  return y + lines.length * lineH;
}

export function paragraph(
  ctx: CanvasRenderingContext2D,
  s: string,
  x: number,
  y: number,
  o: TextOpts & { maxW: number; lineH: number },
): number {
  return drawLines(ctx, wrapLines(ctx, s, o.maxW, o.font), x, y, o.lineH, o);
}

/**
 * 폭에 맞을 때까지 글자 크기를 줄인다.
 * 이름·행운의 아이템처럼 길이를 통제할 수 없는 값이 칸을 밀어내지 않게 한다.
 */
export function fitFont(
  ctx: CanvasRenderingContext2D,
  s: string,
  maxW: number,
  make: (n: number) => string,
  from: number,
  min: number,
): number {
  let size = from;
  while (size > min) {
    ctx.font = make(size);
    if (ctx.measureText(s).width <= maxW) break;
    size -= 2;
  }
  return size;
}

/** 알약 모양 라벨(오행 칩·태그). 그린 폭을 돌려준다 */
export function pill(
  ctx: CanvasRenderingContext2D,
  s: string,
  cx: number,
  y: number,
  o: { font: string; color: string; bg: string; padX: number; h: number },
): number {
  ctx.font = o.font;
  const w = ctx.measureText(s).width + o.padX * 2;
  box(ctx, cx - w / 2, y, w, o.h, o.h / 2, { fill: o.bg });
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = o.color;
  ctx.fillText(s, cx, y + o.h / 2 + 1);
  ctx.textBaseline = "alphabetic";
  return w;
}

/* ── 배경 ─────────────────────────────────────────────── */

/** 문자열 → 32bit 시드. 같은 입력이면 별자리 배치도 같게 나온다 */
export function seedOf(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function starfield(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  seed: number,
  count: number,
) {
  const r = rng(seed);
  ctx.save();
  for (let i = 0; i < count; i++) {
    const x = r() * w;
    const y = r() * h;
    const rad = 1.6 + r() * 3.4;
    const a = 0.22 + r() * 0.6;
    ctx.globalAlpha = a;
    ctx.fillStyle = "#fff";
    ctx.shadowColor = "#d9c8ff";
    ctx.shadowBlur = rad * 4;
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** 앱의 `.app` 배경(위에서 퍼지는 보랏빛)을 카드 비율에 맞게 다시 잡은 것 */
export function nightSky(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  seed: number,
) {
  const base = ctx.createLinearGradient(0, 0, 0, h);
  base.addColorStop(0, "#1b1140");
  base.addColorStop(0.35, "#120a2a");
  base.addColorStop(1, C.bg0);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, w, h);

  const top = ctx.createRadialGradient(w / 2, 0, 0, w / 2, 0, w * 1.05);
  top.addColorStop(0, "rgba(90,50,165,.85)");
  top.addColorStop(0.55, "rgba(58,34,112,.28)");
  top.addColorStop(1, "rgba(58,34,112,0)");
  ctx.fillStyle = top;
  ctx.fillRect(0, 0, w, Math.min(h, w * 1.05));

  const bottom = ctx.createRadialGradient(w * 0.85, h, 0, w * 0.85, h, w * 0.9);
  bottom.addColorStop(0, "rgba(192,38,211,.20)");
  bottom.addColorStop(1, "rgba(192,38,211,0)");
  ctx.fillStyle = bottom;
  ctx.fillRect(0, h - w * 0.9, w, w * 0.9);

  starfield(ctx, w, h, seed, Math.round((w * h) / 26000));
}

/* ── SVG · 내보내기 ───────────────────────────────────── */

/**
 * 캐릭터 SVG 를 이미지로 만든다.
 *
 * 브라우저는 SVG 이미지를 고유 크기(width/height 속성)로 래스터화한 뒤 확대하는
 * 경우가 있어, 그릴 크기를 속성에 미리 박아 넣어야 카드에서 흐려지지 않는다.
 * data: URL 이라 캔버스가 오염되지 않는다(toBlob 가능).
 */
export function svgImage(
  svg: string,
  w: number,
  h: number,
): Promise<HTMLImageElement> {
  const sized = svg
    .trim()
    .replace(/<svg\b[^>]*>/, (tag) =>
      tag
        .replace(/\s(?:width|height)="[^"]*"/g, "")
        .replace(/<svg/, `<svg width="${Math.round(w)}" height="${Math.round(h)}"`),
    );
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("캐릭터 이미지를 그리지 못했어요"));
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(sized);
  });
}

export function toBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("이미지를 만들지 못했어요"))),
      "image/png",
    );
  });
}

export function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // 클릭 직후 revoke 하면 저장이 시작되기 전에 URL 이 사라지는 브라우저가 있다
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/** 파일 공유를 지원하는 환경인지(모바일 대부분 / 데스크톱 일부) */
export function canShareFile(blob: Blob, filename: string): boolean {
  if (typeof navigator === "undefined" || !navigator.canShare) return false;
  try {
    return navigator.canShare({
      files: [new File([blob], filename, { type: blob.type })],
    });
  } catch {
    return false;
  }
}

/** 공유 시트를 띄운다. 사용자가 취소하면 false */
export async function shareFile(
  blob: Blob,
  filename: string,
  title: string,
): Promise<boolean> {
  try {
    await navigator.share({
      files: [new File([blob], filename, { type: blob.type })],
      title,
    });
    return true;
  } catch {
    return false;
  }
}
