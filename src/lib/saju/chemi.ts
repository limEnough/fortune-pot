import { CGH, OH_COLOR, type Ohaeng } from "./constants";
import { computeSaju, ohIdxOfGan, ohOfGan, ohOfJi, isYangGan } from "./calc";
import { ILGAN_NICK } from "./text";
import type { SajuResult } from "@/types/saju";

/*
 * 귀인지도의 궁합(케미) 계산.
 *
 * 기준은 두 사람의 **일간 오행 관계** 하나다. 상생·상극 순환에서 상대가 나의
 * 어느 자리에 서 있느냐가 곧 유형이 된다 — 나를 살려주면 귀인, 내가 살려주면
 * 내 사람, 내가 다스리면 오른팔, 나를 다스리면 호랑이 선생, 같으면 단짝.
 * 유형 다섯이 오행 다섯과 1:1 로 맞물리므로 지도의 다섯 구역이 그대로 유형이 된다.
 *
 * 점수는 유형별 기본값에 지지(연·월·일) 합충과 오행 보완을 더해 조정한다.
 * 난수는 쓰지 않는다 — 같은 두 사람은 언제 봐도 같은 숫자가 나와야 한다.
 */

export type RoleKey = "귀인" | "단짝" | "내사람" | "오른팔" | "호랑이선생";

export interface RoleMeta {
  key: RoleKey;
  label: string;
  emoji: string;
  /** 지도 구역·뱃지 색 */
  color: string;
  /** 유형 한 줄 요약 */
  gist: string;
  /** 이 유형을 대할 때 조심할 점 */
  caution: string;
}

/** 지도의 열두시 방향(귀인)부터 시계 방향 순서 — 구역 배치가 이 순서를 따른다 */
export const ROLES: RoleMeta[] = [
  {
    key: "귀인",
    label: "귀인",
    emoji: "🌟",
    color: "#fcd34d",
    gist: "나를 살려주는 사람",
    caution: "고마운 만큼 기대게 되기 쉬워요. 받기만 하지 말고 돌려줄 자리를 만들어두세요.",
  },
  {
    key: "단짝",
    label: "단짝",
    emoji: "🤝",
    color: "#a78bfa",
    gist: "나와 결이 같은 사람",
    caution: "닮은 만큼 같은 실수를 함께 해요. 서로 다른 시야를 챙겨주는 사람도 곁에 두세요.",
  },
  {
    key: "내사람",
    label: "내 사람",
    emoji: "🌱",
    color: "#4ade80",
    gist: "내가 아끼고 챙기는 사람",
    caution: "주기만 하다 내가 먼저 지쳐요. 내 몫으로 남길 시간과 마음을 정해두세요.",
  },
  {
    key: "오른팔",
    label: "오른팔",
    emoji: "🧭",
    color: "#60a5fa",
    gist: "내 뜻대로 움직여주는 사람",
    caution: "편해서 자꾸 기대게 돼요. 당연하게 여기지 말고 고마움을 자주 말로 표현해주세요.",
  },
  {
    key: "호랑이선생",
    label: "호랑이 선생",
    emoji: "⚡",
    color: "#fb7185",
    gist: "부딪히며 나를 키우는 사람",
    caution: "옳은 말이라도 아플 수 있어요. 감정은 한 박자 두고, 배울 것만 챙기세요.",
  },
];

export const ROLE_MAP: Record<RoleKey, RoleMeta> = Object.fromEntries(
  ROLES.map((r) => [r.key, r]),
) as Record<RoleKey, RoleMeta>;

// 오행 인덱스: 목0 화1 토2 금3 수4 (OH_IDX 와 같은 순서)
const OH_NAME: Ohaeng[] = ["목", "화", "토", "금", "수"];
const OH_HAN = ["木", "火", "土", "金", "水"];

// 상생(A→A+1) 다섯 쌍의 그림말
const SAENG_FIG = [
  "나무가 불을 지피듯",       // 목생화
  "타고 남은 재가 흙이 되듯", // 화생토
  "흙 속에서 쇠가 나오듯",     // 토생금
  "쇠에 이슬이 맺히듯",       // 금생수
  "물이 나무를 키우듯",       // 수생목
];
// 상극(A→A+2) 다섯 쌍의 그림말
const GEUK_FIG = [
  "나무 뿌리가 흙을 파고들듯", // 목극토
  "불이 쇠를 녹이듯",          // 화극금
  "흙이 물길을 막듯",          // 토극수
  "도끼가 나무를 다듬듯",      // 금극목
  "물이 불을 끄듯",            // 수극화
];
// 같은 오행(비화)
const BIHWA_FIG = [
  "한 숲에 선 두 그루처럼",
  "나란히 타오르는 두 불꽃처럼",
  "같은 땅을 딛고 선 것처럼",
  "한 쇳물에서 나온 두 자루처럼",
  "한 줄기에서 갈라진 두 물길처럼",
];

const ROLE_LINE: Record<RoleKey, string> = {
  귀인: "곁에 있으면 기운이 차오르고, 막힌 데를 뚫어주는 사람이에요",
  단짝: "말하지 않아도 통하고, 나란히 걸을 때 가장 편한 사람이에요",
  내사람: "내가 시간과 마음을 써서 챙겨주게 되는 사람이에요",
  오른팔: "내 뜻을 잘 받아 움직여주는, 일이 되게 만드는 사람이에요",
  호랑이선생: "부딪히기도 하지만 결국 나를 자라게 하는 사람이에요",
};

/** 상대가 보는 나 — 공유 링크로 들어온 사람에게 보여줄 반대편 문장 */
const ROLE_MIRROR: Record<RoleKey, string> = {
  귀인: "나에게는 내가 마음 써서 챙기게 되는 사람이에요",
  단짝: "나에게도 결이 같은 편한 사람이에요",
  내사람: "나에게는 기운을 채워주는 고마운 사람이에요",
  오른팔: "나에게는 부딪히며 배우게 되는 사람이에요",
  호랑이선생: "나에게는 내 뜻을 잘 받아주는 사람이에요",
};

const BASE: Record<RoleKey, number> = {
  귀인: 84,
  오른팔: 74,
  단짝: 72,
  내사람: 70,
  호랑이선생: 56,
};

// 육합 — 자축 인해 묘술 진유 사신 오미
const YUKHAP: Record<number, number> = { 0: 1, 1: 0, 2: 11, 11: 2, 3: 10, 10: 3, 4: 9, 9: 4, 5: 8, 8: 5, 6: 7, 7: 6 };
// 삼합 — 신자진(수) 해묘미(목) 인오술(화) 사유축(금)
const SAMHAP: number[][] = [[8, 0, 4], [11, 3, 7], [2, 6, 10], [5, 9, 1]];
// 육해 — 자미 축오 인사 묘진 신해 유술
const YUKHAE: Record<number, number> = { 0: 7, 7: 0, 1: 6, 6: 1, 2: 5, 5: 2, 3: 4, 4: 3, 8: 11, 11: 8, 9: 10, 10: 9 };

type JiRel = "육합" | "삼합" | "동일" | "충" | "해" | null;

function jiRelation(a: number, b: number): JiRel {
  if (a === b) return "동일";
  if (YUKHAP[a] === b) return "육합";
  if (SAMHAP.some((g) => g.includes(a) && g.includes(b))) return "삼합";
  if ((a + 6) % 12 === b) return "충";
  if (YUKHAE[a] === b) return "해";
  return null;
}

const JI_WEIGHT: Record<Exclude<JiRel, null>, number> = {
  육합: 9, 삼합: 7, 동일: 4, 충: -9, 해: -5,
};

/** 여섯 글자(시주 제외)의 오행 집계 — 보완 가점을 매길 때 쓴다 */
function ohTally(sj: SajuResult): Record<Ohaeng, number> {
  const t: Record<Ohaeng, number> = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
  [ohOfGan(sj.year[0]), ohOfJi(sj.year[1]),
   ohOfGan(sj.month[0]), ohOfJi(sj.month[1]),
   ohOfGan(sj.day[0]), ohOfJi(sj.day[1])].forEach((o) => (t[o] += 1));
  return t;
}

export function roleOf(myOh: number, yourOh: number): RoleKey {
  const d = (yourOh - myOh + 5) % 5;
  if (d === 0) return "단짝";
  if (d === 1) return "내사람";      // 내가 생함
  if (d === 2) return "오른팔";      // 내가 극함
  if (d === 3) return "호랑이선생";  // 상대가 나를 극함
  return "귀인";                     // 상대가 나를 생함
}

export interface Chemi {
  role: RoleKey;
  /** 32~99 */
  score: number;
  /** 상대의 일간 오행 — 지도의 별 색 */
  ohaeng: Ohaeng;
  color: string;
  /** "☀️ 한낮의 해" */
  emoji: string;
  nick: string;
  /** "토생금(土生金)" */
  relation: string;
  /** "흙 속에서 쇠가 나오듯 — 내가 시간과 마음을 써서 …" */
  line: string;
  /** 상대 입장에서 본 한 줄(공유 링크 결과 화면) */
  mirror: string;
  caution: string;
}

/** 두 명식의 궁합. mine 이 지도 주인, yours 가 지도에 올라온 사람. */
export function chemistry(mine: SajuResult, yours: SajuResult): Chemi {
  const my = ohIdxOfGan(mine.ilgan);
  const yo = ohIdxOfGan(yours.ilgan);
  const role = roleOf(my, yo);

  let score = BASE[role];

  // 지지 합충 — 일지가 가장 크고, 연지(띠)·월지가 뒤를 받친다
  const rel = (a: number, b: number, w: number) => {
    const r = jiRelation(a, b);
    if (r) score += Math.round(JI_WEIGHT[r] * w);
  };
  rel(mine.day[1], yours.day[1], 1);
  rel(mine.year[1], yours.year[1], 0.45);
  rel(mine.month[1], yours.month[1], 0.35);

  // 오행 보완 — 상대의 일간이 내게 없는 기운이면 반갑고, 넘치는 기운이면 덜하다
  const tally = ohTally(mine);
  const cnt = tally[OH_NAME[yo]];
  if (cnt === 0) score += 7;
  else if (cnt === 1) score += 4;
  else if (cnt >= 4) score -= 4;

  // 음양이 엇갈리면 서로 모자란 자리를 채운다
  if (isYangGan(mine.ilgan) !== isYangGan(yours.ilgan)) score += 3;

  score = Math.max(32, Math.min(99, score));

  const fig =
    role === "단짝" ? BIHWA_FIG[my]
      : role === "내사람" ? SAENG_FIG[my]
      : role === "귀인" ? SAENG_FIG[yo]
      : role === "오른팔" ? GEUK_FIG[my]
      : GEUK_FIG[yo];

  const [a, b] =
    role === "단짝" ? [my, my]
      : role === "내사람" || role === "오른팔" ? [my, yo]
      : [yo, my];
  const verb = role === "단짝" ? "" : role === "귀인" || role === "내사람" ? "생" : "극";
  const relation =
    role === "단짝"
      ? `${OH_NAME[my]}${OH_NAME[my]}(比和)`
      : `${OH_NAME[a]}${verb}${OH_NAME[b]}(${OH_HAN[a]}${verb === "생" ? "生" : "剋"}${OH_HAN[b]})`;

  const oh = ohOfGan(yours.ilgan);
  return {
    role,
    score,
    ohaeng: oh,
    color: OH_COLOR[oh].c,
    emoji: ILGAN_NICK[yours.ilgan].emoji,
    nick: `${ILGAN_NICK[yours.ilgan].nick}(${CGH[yours.ilgan]})`,
    relation,
    line: `${fig} — ${ROLE_LINE[role]}`,
    mirror: `${fig} — ${ROLE_MIRROR[role]}`,
    caution: ROLE_MAP[role].caution,
  };
}

/** 생년월일 문자열 두 개로 바로 — loadManse() 이후에만 부를 수 있다 */
export function chemistryOfBirths(myBirth: string, yourBirth: string): Chemi {
  return chemistry(computeSaju(myBirth, null), computeSaju(yourBirth, null));
}
