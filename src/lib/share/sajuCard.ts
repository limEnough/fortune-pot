import {
  CARD_W,
  CONTENT_W,
  PAD,
  C,
  f,
  fd,
  box,
  magicFill,
  txt,
  pill,
  fitFont,
  paragraph,
  wrapLines,
  drawLines,
  layered,
  nightSky,
  seedOf,
  svgImage,
  ensureFonts,
} from "./draw";
import { CG, CGH, JJ, JJH, JJ_ANI, OH_COLOR } from "@/lib/saju/constants";
import { ohOfGan, ohOfJi, isYangGan } from "@/lib/saju/calc";
import { summarizeSaju } from "@/lib/saju/summary";
import { ILGAN_DETAIL, OH_BOWAN, SIP_STAR, SIP_DESC } from "@/lib/saju/text";
import { CLAY_VARIANTS } from "@/lib/clay/variants";
import type { SajuInput } from "@/types/saju";

const X = PAD;
const R = PAD + CONTENT_W; // 내용 오른쪽 끝
const MAX_H = 4200; // 레이어 여유 높이 — 실제 카드는 그린 만큼만 잘라 쓴다

/** "📜 사주 명식  四柱八字" 형태의 구역 제목. 다음 블록의 top y 를 돌려준다 */
function secLabel(
  ctx: CanvasRenderingContext2D,
  label: string,
  sub: string,
  y: number,
): number {
  txt(ctx, label, X, y, { font: fd(32), color: "#f0e8ff" });
  ctx.font = fd(32);
  txt(ctx, sub, X + ctx.measureText(label).width + 14, y - 2, {
    font: f(21),
    color: C.muted,
  });
  return y + 22;
}

/** 명식 한 칸(천간 또는 지지) */
function ganjiCell(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  o: {
    ss: string;
    hz: string;
    kr: string;
    oh: string;
    color: string;
    bg: string;
    glow?: boolean;
  },
) {
  const h = 196;
  const cx = x + w / 2;

  if (o.glow) {
    // 일간 칸 — 화면의 box-shadow: 0 0 0 2px var(--magic) 와 같은 강조
    ctx.save();
    ctx.shadowColor = "rgba(232,121,249,.55)";
    ctx.shadowBlur = 26;
    ctx.shadowOffsetY = 8;
    box(ctx, x, y, w, h, 26, { fill: o.bg });
    ctx.restore();
  }
  box(ctx, x, y, w, h, 26, {
    fill: o.bg,
    stroke: o.glow ? C.magic : o.color + "55",
    lineWidth: o.glow ? 4 : 2,
  });

  txt(ctx, o.ss, cx, y + 36, { font: f(20, 700), color: o.color, align: "center" });
  txt(ctx, o.hz, cx, y + 110, { font: f(58, 700), color: o.color, align: "center" });
  txt(ctx, o.kr, cx, y + 146, { font: f(22), color: o.color, align: "center" });
  pill(ctx, o.oh, cx, y + 158, {
    font: f(20, 700),
    color: o.color,
    bg: "rgba(255,255,255,.14)",
    padX: 14,
    h: 32,
  });
  return h;
}

/** 반투명 카드 위에 제목 + 문단들을 얹는 공통 블록 */
function textCard(
  ctx: CanvasRenderingContext2D,
  y: number,
  title: string,
  paras: string[],
  o: { rows?: [string, string][]; tone?: "magic" | "plain" } = {},
): number {
  const padX = 34;
  const innerW = CONTENT_W - padX * 2;
  const lineH = 46;

  // 높이를 먼저 잰다 — 카드 배경을 글보다 먼저 깔아야 하므로
  const wrapped = paras.map((p) => wrapLines(ctx, p, innerW, f(26)));
  const rows = o.rows ?? [];
  const rowLabelW = 150;
  const wrappedRows = rows.map(([, v]) =>
    wrapLines(ctx, v, innerW - rowLabelW, f(25)),
  );

  // 아래 그리는 순서와 같은 산수를 미리 돌려 마지막 줄의 baseline 을 찾는다
  let end = 110; // 위 여백 34 + 제목 30 + 제목~본문 46
  wrapped.forEach((ls, i) => (end += (i ? 14 : 0) + ls.length * lineH));
  let last = end - lineH;
  if (rows.length) {
    end += 12 + 40; // 점선 구분 + 첫 행 baseline
    wrappedRows.forEach((ls, i) => (end += (i ? 16 : 0) + ls.length * 44));
    last = end - 44;
  }
  const h = last + 44; // 마지막 줄 아래 여백

  box(ctx, X, y, CONTENT_W, h, 30, {
    fill: o.tone === "plain" ? C.card : magicFill(ctx, X, y, CONTENT_W, h),
    stroke: C.lineSoft,
  });

  let cy = y + 34 + 30;
  txt(ctx, title, X + padX, cy, { font: fd(30), color: C.magic });
  cy += 46;

  wrapped.forEach((ls, i) => {
    if (i) cy += 14;
    cy = drawLines(ctx, ls, X + padX, cy, lineH, { font: f(26), color: "#f0e8ff" });
  });

  if (rows.length) {
    cy += 12;
    ctx.save();
    ctx.setLineDash([8, 8]);
    ctx.strokeStyle = C.lineSoft;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(X + padX, cy);
    ctx.lineTo(R - padX, cy);
    ctx.stroke();
    ctx.restore();
    cy += 40;

    rows.forEach(([k], i) => {
      if (i) cy += 16;
      txt(ctx, k, X + padX, cy, { font: fd(23), color: C.magic });
      cy = drawLines(ctx, wrappedRows[i], X + padX + rowLabelW, cy, 44, {
        font: f(25),
        color: C.textSoft,
      });
    });
  }

  return y + h;
}

/**
 * 사주 정보를 세로로 긴 이미지 카드로 그린다.
 *
 * 화면(`/saju`)의 요약본이다. 세운·월운처럼 날마다 바뀌는 항목은 부적 카드가
 * 맡고, 여기엔 명식·오행·십성·일간처럼 바뀌지 않는 것만 담는다.
 */
export async function drawSajuCard(saju: SajuInput): Promise<HTMLCanvasElement> {
  const s = summarizeSaju(saju);
  const ilgan = ILGAN_DETAIL[s.sj.ilgan];

  const metaLine = `${s.y}년 ${s.mo}월 ${s.d}일 · ${s.hourTxt} · ${saju.gender}성`;
  const domLine = `사주에서 ${s.domSip}의 기운이 가장 도드라져요.`;
  const ilganP1 = `사주의 주인공(일간)은 ${CG[s.sj.ilgan]}(${CGH[s.sj.ilgan]}), 오행으로는 ${s.ilOh} · ${isYangGan(s.sj.ilgan) ? "양(陽)" : "음(陰)"}의 기운이에요.`;
  const ilganP2 = `${ilgan.alias}으로 비유돼요.`;
  const balP1 = `여덟 글자 중 ${s.maxEl} 기운이 가장 강하고, ${s.minEl} 기운이 가장 적어요. 일간 기준으로는 ${s.strength} 편입니다.`;
  const balP2 = `부족한 ${s.minEl}의 기운은 ${OH_BOWAN[s.minEl]}으로 보완하면 흐름이 한결 부드러워져요.`;
  const note =
    "명식은 만세력에 서울 경도 기준 진태양시(균시차 포함) 보정을 적용해 계산했어요.";

  await ensureFonts(
    [
      saju.name,
      metaLine,
      domLine,
      SIP_STAR[s.domSip],
      SIP_DESC[s.domSip],
      ilganP1,
      ilganP2,
      ilgan.personality,
      ilgan.relation,
      ilgan.work,
      ilgan.advice,
      balP1,
      balP2,
      note,
      CG.join(""),
      CGH.join(""),
      JJ.join(""),
      JJH.join(""),
      JJ_ANI.join(""),
      "사주 명식 四柱八字 십성 포함 오행 분석 五行 十星 일원 일간 시주 일주 월주 년주",
      "목화토금수 비겁 식상 재성 관성 인성 미입력 님의 사주",
      "성격 관계 일·재물 조언 오행 균형 일간 풀이 FortunePot 사주로 보는 오늘의 운세",
    ].join(" "),
  );

  const char = await svgImage(CLAY_VARIANTS.love, 300 * 2, 320 * 2).catch(
    () => null,
  );

  return layered(
    CARD_W,
    MAX_H,
    (ctx) => {
      let y = 92;

      /* ── 헤더 ── */
      const charW = 250;
      const charH = Math.round((charW * 320) / 300);
      if (char) {
        ctx.save();
        ctx.shadowColor = "rgba(60,20,110,.55)";
        ctx.shadowBlur = 40;
        ctx.shadowOffsetY = 20;
        ctx.drawImage(char, X - 14, y, charW, charH);
        ctx.restore();
      }

      const headX = X + charW + 18;
      const headW = R - headX;
      const name = saju.name;
      const size = fitFont(ctx, `${name}님의 사주`, headW, fd, 54, 34);
      let hy = y + charH / 2 - 18;
      txt(ctx, name, headX, hy, { font: fd(size), color: C.magic });
      ctx.font = fd(size);
      txt(ctx, "님의 사주", headX + ctx.measureText(name).width, hy, {
        font: fd(size),
        color: C.text,
      });
      hy += 44;
      hy = paragraph(ctx, metaLine, headX, hy, {
        font: f(23),
        color: C.muted,
        maxW: headW,
        lineH: 36,
      });

      y += charH + 34;

      /* ── 명식 ── */
      y = secLabel(ctx, "📜 사주 명식", "四柱八字 · 십성 포함", y);
      y += 26;

      const gap = 16;
      const colW = (CONTENT_W - gap * 3) / 4;
      const pillars: { lab: string; p: [number, number] | null; day: boolean }[] = [
        { lab: "시주", p: s.sj.hour, day: false },
        { lab: "일주", p: s.sj.day, day: true },
        { lab: "월주", p: s.sj.month, day: false },
        { lab: "년주", p: s.sj.year, day: false },
      ];

      pillars.forEach((pl, i) => {
        const cx = X + i * (colW + gap) + colW / 2;
        const cellX = X + i * (colW + gap);
        txt(ctx, pl.lab, cx, y, {
          font: f(22, 700),
          color: pl.day ? C.magic : C.muted,
          align: "center",
        });

        const top = y + 22;
        if (!pl.p) {
          [0, 1].forEach((k) => {
            const cy = top + k * 210;
            box(ctx, cellX, cy, colW, 196, 26, {
              fill: "rgba(255,255,255,.03)",
              stroke: C.lineSoft,
              dash: [10, 8],
            });
            txt(ctx, "?", cx, cy + 110, {
              font: f(58, 700),
              color: "rgba(122,106,166,.6)",
              align: "center",
            });
            txt(ctx, "미입력", cx, cy + 146, {
              font: f(22),
              color: "#7a6aa6",
              align: "center",
            });
          });
          return;
        }

        const [g, z] = pl.p;
        const go = ohOfGan(g);
        const zo = ohOfJi(z);
        ganjiCell(ctx, cellX, top, colW, {
          ss: pl.day ? "일원" : s.sipGan(g),
          hz: CGH[g],
          kr: CG[g],
          oh: go,
          color: OH_COLOR[go].c,
          bg: OH_COLOR[go].bg,
          glow: pl.day,
        });
        ganjiCell(ctx, cellX, top + 210, colW, {
          ss: s.sipJi(z),
          hz: JJH[z],
          kr: `${JJ[z]}·${JJ_ANI[z]}`,
          oh: zo,
          color: OH_COLOR[zo].c,
          bg: OH_COLOR[zo].bg,
        });
      });
      y += 22 + 196 + 14 + 196 + 48;

      /* ── 오행 분석 ── */
      y = secLabel(ctx, "⚖️ 오행 분석", "五行", y);
      y += 26;

      const ohH = 60 + s.els.length * 50;
      box(ctx, X, y, CONTENT_W, ohH, 30, { fill: C.card, stroke: C.lineSoft });
      s.els.forEach((k, i) => {
        const cy = y + 30 + i * 50 + 25;
        const col = OH_COLOR[k].c;
        txt(ctx, k, X + 34, cy + 9, { font: f(24, 700), color: col });
        const barX = X + 100;
        const barW = CONTENT_W - 100 - 34 - 60;
        box(ctx, barX, cy - 9, barW, 18, 9, { fill: "rgba(255,255,255,.07)" });
        const pct = s.total ? s.tally[k] / s.total : 0;
        if (pct > 0)
          box(ctx, barX, cy - 9, Math.max(18, barW * pct), 18, 9, { fill: col });
        txt(ctx, String(s.tally[k]), R - 34, cy + 8, {
          font: f(23),
          color: C.muted,
          align: "right",
        });
      });
      y += ohH + 48;

      /* ── 십성 ── */
      y = secLabel(ctx, "⭐ 십성 카드", "十星", y);
      y += 26;

      const keys = Object.keys(s.catCnt);
      const sGap = 14;
      const sW = (CONTENT_W - sGap * (keys.length - 1)) / keys.length;
      keys.forEach((k, i) => {
        const bx = X + i * (sW + sGap);
        box(ctx, bx, y, sW, 124, 24, { fill: C.card, stroke: C.lineSoft });
        txt(ctx, k, bx + sW / 2, y + 44, {
          font: f(22),
          color: C.muted,
          align: "center",
        });
        txt(ctx, String(s.catCnt[k]), bx + sW / 2, y + 96, {
          font: fd(38),
          color: "#f0e8ff",
          align: "center",
        });
      });
      y += 124 + 22;

      y = textCard(ctx, y, `${s.domSip} · ${SIP_STAR[s.domSip]}`, [
        domLine,
        SIP_DESC[s.domSip],
      ]);
      y += 48;

      /* ── 일간 풀이 ── */
      y = textCard(
        ctx,
        y,
        `🔮 일간 풀이 · ${CGH[s.sj.ilgan]}${CG[s.sj.ilgan]}`,
        [ilganP1, ilganP2],
        {
          rows: [
            ["🌱 성격", ilgan.personality],
            ["🤝 관계", ilgan.relation],
            ["💼 일·재물", ilgan.work],
            ["🪄 조언", ilgan.advice],
          ],
        },
      );
      y += 22;

      /* ── 오행 균형 ── */
      y = textCard(ctx, y, "🌿 오행 균형", [balP1, balP2]);
      y += 56;

      /* ── 푸터 ── */
      ctx.strokeStyle = C.lineSoft;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(X, y);
      ctx.lineTo(R, y);
      ctx.stroke();
      y += 50;

      txt(ctx, "FortunePot", CARD_W / 2, y, {
        font: fd(30),
        color: C.magic,
        align: "center",
      });
      y += 34;
      txt(ctx, "사주로 보는 오늘의 운세", CARD_W / 2, y, {
        font: f(21),
        color: C.muted,
        align: "center",
      });
      y += 40;
      y = paragraph(ctx, note, CARD_W / 2, y, {
        font: f(19),
        color: "#8a7bb6",
        align: "center",
        maxW: CONTENT_W - 80,
        lineH: 30,
      });

      return y + PAD - 10;
    },
    (ctx, w, h) => nightSky(ctx, w, h, seedOf(saju.name + saju.birth)),
  );
}
