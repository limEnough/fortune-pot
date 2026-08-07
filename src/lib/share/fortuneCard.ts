import {
  CARD_W,
  C,
  f,
  fd,
  box,
  txt,
  fitFont,
  wrapLines,
  drawLines,
  layered,
  nightSky,
  seedOf,
  svgImage,
  ensureFonts,
} from "./draw";
import { stars, type Fortune } from "@/lib/saju/fortune";
import { CLAY_VARIANTS } from "@/lib/clay/variants";

/*
 * 오늘의 운세 부적(符籍) 카드.
 *
 * 사주 카드가 세로로 긴 정보지라면 이쪽은 한 장짜리 부적이다. 전통 부적의
 * 뼈대 — 위쪽 「勅令」 표제, 테두리 문양, 아래쪽 붉은 낙관 — 를 앱의 보라·금색
 * 팔레트로 옮겼다. 내용은 화면(`FortuneCard`)과 같고 순서도 같다.
 */

const W = CARD_W;
const PAD = 88; // 테두리 문양 안쪽 여백 — 사주 카드(64)보다 넓다
const X = PAD;
const R = W - PAD;
const IN_W = W - PAD * 2;
const MAX_H = 3600;

const GOLD = C.gold;
const GOLD_DIM = "rgba(252,211,77,.42)";
const SEAL = "#c02a3a";

/** 두 가지 색으로 이어 붙인 한 줄을 가운데 정렬로 그린다 */
function twoTone(
  ctx: CanvasRenderingContext2D,
  a: string,
  b: string,
  cx: number,
  y: number,
  font: string,
  ca: string,
  cb: string,
) {
  ctx.font = font;
  const wa = ctx.measureText(a).width;
  const wb = ctx.measureText(b).width;
  const sx = cx - (wa + wb) / 2;
  txt(ctx, a, sx, y, { font, color: ca });
  txt(ctx, b, sx + wa, y, { font, color: cb });
}

/** 네 귀퉁이 문양 — 부적 테두리를 여미는 마름모 + 짧은 갈고리 */
function corner(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  sx: number,
  sy: number,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(sx, sy);
  ctx.strokeStyle = GOLD_DIM;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 34);
  ctx.lineTo(0, 0);
  ctx.lineTo(34, 0);
  ctx.stroke();

  ctx.fillStyle = GOLD;
  ctx.globalAlpha = 0.75;
  ctx.beginPath();
  ctx.moveTo(17, 8);
  ctx.lineTo(26, 17);
  ctx.lineTo(17, 26);
  ctx.lineTo(8, 17);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function frame(ctx: CanvasRenderingContext2D, w: number, h: number) {
  box(ctx, 30, 30, w - 60, h - 60, 44, { stroke: GOLD_DIM, lineWidth: 5 });
  box(ctx, 46, 46, w - 92, h - 92, 32, {
    stroke: "rgba(252,211,77,.20)",
    lineWidth: 2,
  });
  const m = 62;
  corner(ctx, m, m, 1, 1);
  corner(ctx, w - m, m, -1, 1);
  corner(ctx, m, h - m, 1, -1);
  corner(ctx, w - m, h - m, -1, -1);
}

/** 붉은 낙관(도장) */
function seal(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.06);
  ctx.globalAlpha = 0.92;

  ctx.fillStyle = SEAL;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(253,243,227,.55)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, r - 12, 0, Math.PI * 2);
  ctx.stroke();

  ctx.globalAlpha = 1;
  ctx.fillStyle = C.cream;
  ctx.font = f(Math.round(r * 0.95), 700);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("福", 0, 2);
  ctx.textBaseline = "alphabetic";
  ctx.restore();
}

export async function drawFortuneCard(
  fortune: Fortune,
  name: string,
): Promise<HTMLCanvasElement> {
  await ensureFonts(
    [
      name,
      fortune.dateLabel,
      fortune.grade,
      fortune.overall,
      fortune.advice,
      fortune.color[0],
      fortune.item,
      ...fortune.categories.map((c) => c.key + c.line),
      "勅令 福 님의 오늘 운세 총운 행운의 색 숫자 아이템 오늘의 한마디",
      "FortunePot 사주로 보는 오늘의 운세 부적",
    ].join(" "),
  );

  const char = await svgImage(
    CLAY_VARIANTS[fortune.moodKey] ?? CLAY_VARIANTS.base,
    300 * 2,
    320 * 2,
  ).catch(() => null);

  return layered(
    W,
    MAX_H,
    (ctx) => {
      /* ── 「勅令」 표제 ── */
      let y = 108;
      const plaqueW = 132;
      const plaqueH = 224;
      const px = W / 2 - plaqueW / 2;
      box(ctx, px, y, plaqueW, plaqueH, 22, {
        fill: "rgba(252,211,77,.10)",
        stroke: GOLD_DIM,
        lineWidth: 3,
      });
      txt(ctx, "勅", W / 2, y + 92, {
        font: f(64, 700),
        color: GOLD,
        align: "center",
      });
      txt(ctx, "令", W / 2, y + 190, {
        font: f(64, 700),
        color: GOLD,
        align: "center",
      });
      y += plaqueH + 52;

      /* ── 날짜 · 이름 ── */
      txt(ctx, fortune.dateLabel, W / 2, y, {
        font: f(24, 700),
        color: C.muted,
        align: "center",
      });
      y += 58;
      twoTone(ctx, name, "님의 오늘", W / 2, y, fd(50), C.magic, C.text);
      y += 34;

      /* ── 캐릭터 ── */
      const cw = 260;
      const ch = Math.round((cw * 320) / 300);
      if (char) {
        ctx.save();
        ctx.shadowColor = "rgba(60,20,110,.55)";
        ctx.shadowBlur = 44;
        ctx.shadowOffsetY = 22;
        ctx.drawImage(char, W / 2 - cw / 2, y, cw, ch);
        ctx.restore();
      }
      y += ch + 14;

      /* ── 총운 ── */
      const overallLines = wrapLines(ctx, fortune.overall, IN_W - 76, f(28));
      // 별 68 → 등급 +112 → 총평 첫 줄 +56 → 남은 줄 +44 씩 → 아래 여백 34
      const gradeH = 236 + (overallLines.length - 1) * 44 + 34;
      const g = ctx.createLinearGradient(X, y, R, y + gradeH);
      g.addColorStop(0, "rgba(167,139,250,.26)");
      g.addColorStop(1, "rgba(232,121,249,.16)");
      box(ctx, X, y, IN_W, gradeH, 36, { fill: g, stroke: GOLD_DIM });

      let cy = y + 68;
      txt(ctx, stars(fortune.score), W / 2, cy, {
        font: f(44),
        color: GOLD,
        align: "center",
      });
      cy += 112;
      txt(ctx, fortune.grade, W / 2, cy, {
        font: fd(92),
        color: "#fff",
        align: "center",
      });
      cy += 56;
      drawLines(ctx, overallLines, W / 2, cy, 44, {
        font: f(28),
        color: "#efe6ff",
        align: "center",
      });
      y += gradeH + 34;

      /* ── 분야별 운세 ── */
      fortune.categories.forEach((c) => {
        const lines = wrapLines(ctx, c.line, IN_W - 150, f(25));
        const h = 44 + 40 + lines.length * 40;
        box(ctx, X, y, IN_W, h, 28, { fill: C.card, stroke: C.lineSoft });

        const icx = X + 56;
        const icy = y + h / 2;
        ctx.fillStyle = "rgba(167,139,250,.18)";
        ctx.beginPath();
        ctx.arc(icx, icy, 34, 0, Math.PI * 2);
        ctx.fill();
        txt(ctx, c.icon, icx, icy + 13, {
          font: f(34),
          color: "#fff",
          align: "center",
        });

        const tx = X + 110;
        txt(ctx, c.key, tx, y + 52, { font: f(26, 700), color: C.text });
        txt(ctx, stars(c.score), R - 30, y + 52, {
          font: f(24),
          color: GOLD,
          align: "right",
        });
        drawLines(ctx, lines, tx, y + 92, 40, { font: f(25), color: C.muted });
        y += h + 14;
      });
      y += 20;

      /* ── 행운의 색 · 숫자 · 아이템 ── */
      const lgap = 14;
      const lw = (IN_W - lgap * 2) / 3;
      const lucky: [string, string][] = [
        ["행운의 색", fortune.color[0]],
        ["행운의 숫자", String(fortune.number)],
        ["행운의 아이템", fortune.item],
      ];
      const luckyH = 152;
      lucky.forEach(([k, v], i) => {
        const bx = X + i * (lw + lgap);
        box(ctx, bx, y, lw, luckyH, 28, { fill: C.card, stroke: C.lineSoft });
        txt(ctx, k, bx + lw / 2, y + 50, {
          font: f(21),
          color: C.muted,
          align: "center",
        });

        if (i === 0) {
          // 색 이름 왼쪽에 실제 색 스와치를 붙인다
          const size = fitFont(ctx, v, lw - 90, fd, 32, 20);
          ctx.font = fd(size);
          const tw = ctx.measureText(v).width;
          const sw = 28;
          const sx = bx + lw / 2 - (tw + sw + 12) / 2;
          box(ctx, sx, y + 90, sw, sw, 9, {
            fill: fortune.color[1],
            stroke: "rgba(255,255,255,.25)",
          });
          txt(ctx, v, sx + sw + 12, y + 90 + sw - 5, {
            font: fd(size),
            color: C.text,
          });
        } else {
          const size = fitFont(ctx, v, lw - 36, fd, 32, 19);
          const ls = wrapLines(ctx, v, lw - 36, fd(size));
          drawLines(ctx, ls, bx + lw / 2, y + (ls.length > 1 ? 98 : 112), 36, {
            font: fd(size),
            color: C.text,
            align: "center",
          });
        }
      });
      y += luckyH + 34;

      /* ── 오늘의 한마디 ── */
      const adviceLines = wrapLines(ctx, fortune.advice, IN_W - 76, f(27));
      // 라벨 56 → 본문 첫 줄 +56 → 남은 줄 +46 씩 → 아래 여백 40
      const adviceH = 112 + (adviceLines.length - 1) * 46 + 40;
      const ag = ctx.createLinearGradient(X, y, R, y + adviceH);
      ag.addColorStop(0, "rgba(252,211,77,.14)");
      ag.addColorStop(1, "rgba(232,121,249,.10)");
      box(ctx, X, y, IN_W, adviceH, 32, { fill: ag, stroke: GOLD_DIM });
      txt(ctx, "오늘의 한마디", X + 38, y + 56, { font: fd(28), color: GOLD });
      drawLines(ctx, adviceLines, X + 38, y + 112, 46, {
        font: f(27),
        color: "#f6efff",
      });
      y += adviceH + 52;

      /* ── 낙관 · 브랜드 ── */
      seal(ctx, W / 2, y + 60, 60);
      y += 156;
      txt(ctx, "FortunePot", W / 2, y, {
        font: fd(28),
        color: C.magic,
        align: "center",
      });
      y += 32;
      txt(ctx, "사주로 보는 오늘의 운세", W / 2, y, {
        font: f(20),
        color: C.muted,
        align: "center",
      });

      return y + PAD + 10;
    },
    (ctx, w, h) => {
      nightSky(ctx, w, h, seedOf(name + fortune.dateLabel));
      // 표제 뒤로 번지는 금빛 — 부적다운 온기를 준다
      const warm = ctx.createRadialGradient(w / 2, 200, 0, w / 2, 200, w * 0.6);
      warm.addColorStop(0, "rgba(252,211,77,.12)");
      warm.addColorStop(1, "rgba(252,211,77,0)");
      ctx.fillStyle = warm;
      ctx.fillRect(0, 0, w, Math.min(h, w));
      frame(ctx, w, h);
    },
  );
}
