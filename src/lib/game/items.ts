/*
 * 꾸미기 아이템 카탈로그.
 *
 * 방 SVG(`public/game/rooms/room-front.svg`)는 슬롯마다 `<g id="...">` 로 잘려
 * 있다. 아이템 하나는 **그 그룹의 속을 통째로 갈아 끼우는 SVG 조각**이다.
 * 서버에는 고른 아이템 id 만 저장하고(`Room.decor`), 조각은 코드에 둔다 —
 * 사용자가 만든 마크업이 DB 를 거쳐 화면에 꽂히는 길을 아예 만들지 않기 위해서다.
 *
 * 조각은 **자기완결적**이어야 한다. 방 SVG 의 `defs`(rf-*)를 참조하면 그 슬롯을
 * 갈아 끼운 뒤 사라질 수 있고, 프로필 이미지로 구울 때도 바깥 참조가 있으면
 * 캔버스가 오염된다. 그래서 필요한 그라디언트·패턴은 조각 안에 `it-{id}-` 접두사로
 * 직접 들고 있는다.
 *
 * 좌표계는 방 viewBox 그대로(900×640): 벽 y 0~452, 걸레받이 y 440, 바닥 y 452~640.
 */

export const SLOT_KEYS = [
  "wall",
  "floor",
  "window",
  "poster",
  "shelf",
  "rug",
  "furnitureLeft",
  "furnitureRight",
] as const;
export type SlotKey = (typeof SLOT_KEYS)[number];

/** 슬롯 → 방 SVG 안의 그룹 id */
export const SLOT_GROUP: Record<SlotKey, string> = {
  wall: "layer-wall",
  floor: "layer-floor",
  window: "slot-window",
  poster: "slot-poster",
  shelf: "slot-shelf",
  rug: "slot-rug",
  furnitureLeft: "slot-furniture-left",
  furnitureRight: "slot-furniture-right",
};

export const SLOT_LABEL: Record<SlotKey, string> = {
  wall: "벽지",
  floor: "바닥",
  window: "창문",
  poster: "액자",
  shelf: "선반",
  rug: "러그",
  furnitureLeft: "왼쪽 가구",
  furnitureRight: "오른쪽 가구",
};

export interface DecorItem {
  id: string;
  slot: SlotKey;
  name: string;
  /** 포인트. 0 이면 처음부터 갖고 있다(기본 · 비우기) */
  price: number;
  /**
   * 그룹에 채워 넣을 SVG 조각.
   * `null` 이면 방 에셋의 기본 모습을 그대로 두고, `""` 이면 비운다.
   */
  svg: string | null;
  /** 팔레트 칩에 쓸 CSS 배경 — 조각을 실제로 그리지 않고도 고를 수 있게 */
  swatch: string;
}

/* ── 벽지 ─────────────────────────────────────────────── */

const WALL_LAVENDER = `
<defs>
  <pattern id="it-wl-lav" width="96" height="16" patternUnits="userSpaceOnUse">
    <rect width="96" height="16" fill="#3B2A6B"/><rect width="48" height="16" fill="#48347F"/>
  </pattern>
  <linearGradient id="it-wl-lav-s" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#1A1136" stop-opacity="0"/>
    <stop offset="100%" stop-color="#1A1136" stop-opacity=".5"/>
  </linearGradient>
</defs>
<rect x="0" y="0" width="900" height="452" fill="url(#it-wl-lav)"/>
<rect x="0" y="0" width="900" height="452" fill="url(#it-wl-lav-s)"/>
<rect x="0" y="0" width="900" height="16" fill="#5B4499"/>
<rect x="0" y="396" width="900" height="8" fill="#4A3684" opacity=".8"/>`;

const WALL_CONSTELLATION = `
<defs>
  <radialGradient id="it-wl-con" cx="50%" cy="18%" r="86%">
    <stop offset="0%" stop-color="#2C2A6E"/><stop offset="100%" stop-color="#191340"/>
  </radialGradient>
</defs>
<rect x="0" y="0" width="900" height="452" fill="url(#it-wl-con)"/>
<g stroke="#8B5CF6" stroke-width="2" fill="none" opacity=".6" stroke-linecap="round">
  <path d="M120 120 L196 168 L262 128 L330 196"/>
  <path d="M520 96 L586 150 L668 122 L720 190 L640 236"/>
  <path d="M180 300 L268 330 L350 296"/>
  <path d="M700 300 L776 268 L846 322"/>
</g>
<g fill="#EDE7FF">
  <circle cx="120" cy="120" r="4"/><circle cx="196" cy="168" r="3"/>
  <circle cx="262" cy="128" r="3.4"/><circle cx="330" cy="196" r="4.2"/>
  <circle cx="520" cy="96" r="3.6"/><circle cx="586" cy="150" r="3"/>
  <circle cx="668" cy="122" r="4"/><circle cx="720" cy="190" r="3"/>
  <circle cx="640" cy="236" r="3.4"/><circle cx="180" cy="300" r="3.2"/>
  <circle cx="268" cy="330" r="4"/><circle cx="350" cy="296" r="3"/>
  <circle cx="700" cy="300" r="3"/><circle cx="776" cy="268" r="3.8"/>
  <circle cx="846" cy="322" r="3.2"/>
</g>
<rect x="0" y="0" width="900" height="16" fill="#3E2C72"/>
<rect x="0" y="396" width="900" height="8" fill="#2E2358" opacity=".8"/>`;

const WALL_DAWN = `
<defs>
  <linearGradient id="it-wl-dawn" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#43286B"/><stop offset="44%" stop-color="#84497A"/>
    <stop offset="76%" stop-color="#C9736E"/><stop offset="100%" stop-color="#E79E6E"/>
  </linearGradient>
</defs>
<rect x="0" y="0" width="900" height="452" fill="url(#it-wl-dawn)"/>
<g fill="#FFF6E4" opacity=".55">
  <circle cx="86" cy="58" r="2.2"/><circle cx="248" cy="40" r="1.6"/>
  <circle cx="430" cy="72" r="2"/><circle cx="612" cy="46" r="1.8"/>
  <circle cx="800" cy="66" r="2.2"/><circle cx="694" cy="112" r="1.5"/>
  <circle cx="150" cy="132" r="1.6"/><circle cx="352" cy="118" r="1.8"/>
</g>
<circle cx="760" cy="150" r="26" fill="#FFF1CE" opacity=".85"/>
<rect x="0" y="0" width="900" height="16" fill="#5B4499"/>
<rect x="0" y="396" width="900" height="8" fill="#B9705F" opacity=".55"/>`;

/* ── 바닥 ─────────────────────────────────────────────── */

/** 걸레받이는 벽과 바닥이 만나는 선이라 바닥 조각마다 다시 그린다 */
const skirting = (base: string, top: string) => `
<rect x="0" y="440" width="900" height="16" rx="4" fill="${base}"/>
<rect x="0" y="440" width="900" height="4" fill="${top}"/>`;

const FLOOR_CHECK = `
<defs>
  <pattern id="it-fl-chk" width="120" height="60" patternUnits="userSpaceOnUse">
    <rect width="120" height="60" fill="#2A1C51"/>
    <rect width="60" height="30" fill="#3A2870"/>
    <rect x="60" y="30" width="60" height="30" fill="#3A2870"/>
  </pattern>
</defs>
<rect x="0" y="452" width="900" height="188" fill="url(#it-fl-chk)"/>
${skirting("#3E2C72", "#57409A")}`;

const FLOOR_CLOUD = `
<defs>
  <linearGradient id="it-fl-cld" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#584A90"/><stop offset="100%" stop-color="#312656"/>
  </linearGradient>
  <filter id="it-fl-cld-b" x="-30%" y="-60%" width="160%" height="220%">
    <feGaussianBlur stdDeviation="12"/>
  </filter>
</defs>
<rect x="0" y="452" width="900" height="188" fill="url(#it-fl-cld)"/>
<g fill="#8B78D0" opacity=".45" filter="url(#it-fl-cld-b)">
  <ellipse cx="160" cy="516" rx="150" ry="32"/>
  <ellipse cx="520" cy="592" rx="200" ry="38"/>
  <ellipse cx="836" cy="502" rx="126" ry="28"/>
</g>
${skirting("#4A3A85", "#6B57B5")}`;

const FLOOR_SEA = `
<defs>
  <linearGradient id="it-fl-sea" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#143C66"/><stop offset="100%" stop-color="#0A1A38"/>
  </linearGradient>
</defs>
<rect x="0" y="452" width="900" height="188" fill="url(#it-fl-sea)"/>
<g stroke="#5AA8F5" stroke-width="3" fill="none" opacity=".4" stroke-linecap="round">
  <path d="M20 486 q30 -12 60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0"/>
  <path d="M-10 538 q30 -12 60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0"/>
  <path d="M20 592 q30 -12 60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0"/>
</g>
${skirting("#26407A", "#3D62B0")}`;

/* ── 러그 ─────────────────────────────────────────────── */

const RUG_STAR = `
<ellipse cx="450" cy="562" rx="244" ry="72" fill="#0F0A24" opacity=".3"/>
<path d="M450 492 L511 534 L669 538 L548 567 L585 611 L450 588 L315 611 L352 567 L231 538 L389 534 Z"
      fill="#F5C263"/>
<path d="M450 492 L511 534 L669 538 L548 567 L585 611 L450 588 L315 611 L352 567 L231 538 L389 534 Z"
      fill="none" stroke="#FFE9B0" stroke-width="5" stroke-linejoin="round" opacity=".8"/>
<ellipse cx="450" cy="560" rx="72" ry="22" fill="#E0A94B" opacity=".55"/>`;

const RUG_DONUT = `
<ellipse cx="450" cy="558" rx="246" ry="74" fill="#0F0A24" opacity=".3"/>
<ellipse cx="450" cy="558" rx="234" ry="66" fill="#FDF3E3"/>
<ellipse cx="450" cy="558" rx="186" ry="52" fill="#E879F9" opacity=".85"/>
<ellipse cx="450" cy="558" rx="138" ry="39" fill="#FDF3E3"/>
<ellipse cx="450" cy="558" rx="92" ry="26" fill="#8B5CF6" opacity=".9"/>
<ellipse cx="450" cy="558" rx="44" ry="12" fill="#FDF3E3"/>`;

/* ── 창문 ─────────────────────────────────────────────── */

const WINDOW_ROUND = `
<defs>
  <linearGradient id="it-wn-sky" x1="0" y1="0" x2="0.3" y2="1">
    <stop offset="0%" stop-color="#2E3E86"/><stop offset="60%" stop-color="#3A2A6E"/>
    <stop offset="100%" stop-color="#5A3574"/>
  </linearGradient>
  <radialGradient id="it-wn-moon" cx="36%" cy="30%" r="72%">
    <stop offset="0%" stop-color="#FFF6D8"/><stop offset="100%" stop-color="#F5D98A"/>
  </radialGradient>
  <clipPath id="it-wn-clip"><circle cx="210" cy="192" r="96"/></clipPath>
</defs>
<circle cx="210" cy="192" r="112" fill="#4A3684"/>
<circle cx="210" cy="192" r="96" fill="url(#it-wn-sky)"/>
<g clip-path="url(#it-wn-clip)">
  <circle cx="238" cy="152" r="34" fill="url(#it-wn-moon)"/>
  <g fill="#FFFFFF" opacity=".9">
    <circle cx="152" cy="150" r="2.4"/><circle cx="186" cy="122" r="1.8"/>
    <circle cx="146" cy="216" r="2"/><circle cx="256" cy="238" r="2.4"/>
    <circle cx="196" cy="252" r="1.6"/>
  </g>
  <path d="M114 264 C154 236 190 260 228 250 C262 240 290 252 306 248 L306 292 L114 292 Z" fill="#2A1B52"/>
</g>
<circle cx="210" cy="192" r="96" fill="none" stroke="#5B4499" stroke-width="10"/>
<rect x="204" y="90" width="12" height="204" rx="6" fill="#5B4499"/>
<rect x="108" y="186" width="204" height="12" rx="6" fill="#5B4499"/>
<circle cx="210" cy="192" r="114" fill="none" stroke="#6D4FBF" stroke-width="5" opacity=".7"/>`;

/* ── 액자 ─────────────────────────────────────────────── */

const POSTER_STAR = `
<rect x="418" y="92" width="132" height="160" rx="14" fill="#F5C263"/>
<rect x="428" y="102" width="112" height="140" rx="8" fill="#1B1240"/>
<g stroke="#A78BFA" stroke-width="2" fill="none" opacity=".8" stroke-linecap="round">
  <path d="M448 132 L478 158 L508 128"/><path d="M478 158 L470 200 L512 208"/>
</g>
<g fill="#FFF3C4">
  <circle cx="448" cy="132" r="3.4"/><circle cx="478" cy="158" r="4"/>
  <circle cx="508" cy="128" r="3"/><circle cx="470" cy="200" r="3.4"/>
  <circle cx="512" cy="208" r="3"/>
</g>
<rect x="446" y="222" width="76" height="6" rx="3" fill="#4A3684"/>`;

/* ── 선반 ─────────────────────────────────────────────── */

const SHELF_PLANT = `
<defs>
  <linearGradient id="it-sh-wd" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#5B3F94"/><stop offset="100%" stop-color="#3E2A6B"/>
  </linearGradient>
</defs>
<rect x="580" y="196" width="228" height="13" rx="6.5" fill="url(#it-sh-wd)"/>
<rect x="580" y="196" width="228" height="4" rx="2" fill="#6D4FBF"/>
<path d="M600 196 L596 164 L638 164 L634 196 Z" fill="#8B5CF6"/>
<path d="M617 164 C602 152 600 132 610 120 C624 128 628 150 617 164 Z" fill="#63D28C"/>
<path d="M617 164 C634 156 642 136 634 124 C620 130 610 150 617 164 Z" fill="#8FE3AE"/>
<path d="M672 196 L668 172 L702 172 L698 196 Z" fill="#A78BFA"/>
<path d="M685 172 C674 160 676 144 686 138 C696 146 694 164 685 172 Z" fill="#4FBF7C"/>
<path d="M740 196 L734 158 L788 158 L782 196 Z" fill="#7C57D6"/>
<path d="M761 158 C744 142 742 116 756 104 C772 116 774 144 761 158 Z" fill="#63D28C"/>
<path d="M761 158 C780 146 788 120 778 108 C762 118 752 144 761 158 Z" fill="#A3E635"/>`;

/* ── 가구 ─────────────────────────────────────────────── */

const FURN_LEFT_STOOL = `
<ellipse cx="130" cy="536" rx="56" ry="14" fill="#0F0A24" opacity=".5"/>
<rect x="88" y="452" width="84" height="20" rx="10" fill="#7C57D6"/>
<rect x="96" y="470" width="12" height="62" rx="6" fill="#4A3684"/>
<rect x="152" y="470" width="12" height="62" rx="6" fill="#4A3684"/>
<rect x="94" y="500" width="72" height="9" rx="4.5" fill="#4A3684"/>
<path d="M130 396 L142 428 L176 430 L149 450 L158 482 L130 464 L102 482 L111 450 L84 430 L118 428 Z"
      fill="#FFD84D" opacity=".95"/>`;

const FURN_RIGHT_TABLE = `
<ellipse cx="750" cy="534" rx="78" ry="16" fill="#0F0A24" opacity=".5"/>
<ellipse cx="750" cy="452" rx="88" ry="22" fill="#7C57D6"/>
<ellipse cx="750" cy="446" rx="88" ry="22" fill="#9268E8"/>
<rect x="742" y="458" width="16" height="66" rx="8" fill="#4A3684"/>
<ellipse cx="750" cy="524" rx="44" ry="12" fill="#5B4499"/>
<ellipse cx="726" cy="440" rx="20" ry="8" fill="#FDF3E3"/>
<path d="M708 438 C708 424 744 424 744 438 C744 450 736 456 726 456 C716 456 708 450 708 438 Z" fill="#FDF3E3"/>
<path d="M744 432 C756 430 758 446 746 446" fill="none" stroke="#FDF3E3" stroke-width="4"/>
<ellipse cx="726" cy="437" rx="13" ry="5" fill="#E879F9" opacity=".8"/>
<path d="M778 446 L774 428 L800 428 L796 446 Z" fill="#A78BFA"/>
<path d="M787 428 C778 418 780 406 788 400 C796 408 794 422 787 428 Z" fill="#63D28C"/>`;

/* ── 카탈로그 ─────────────────────────────────────────── */

export const ITEMS: DecorItem[] = [
  // 벽지
  { id: "wall-night", slot: "wall", name: "밤하늘 벽지", price: 0, svg: null, swatch: "linear-gradient(180deg,#38265F,#231741)" },
  { id: "wall-lavender", slot: "wall", name: "라벤더 줄무늬", price: 200, svg: WALL_LAVENDER, swatch: "repeating-linear-gradient(90deg,#48347F 0 6px,#3B2A6B 6px 12px)" },
  { id: "wall-constellation", slot: "wall", name: "별자리 벽지", price: 260, svg: WALL_CONSTELLATION, swatch: "radial-gradient(circle at 50% 20%,#2C2A6E,#191340)" },
  { id: "wall-dawn", slot: "wall", name: "새벽 하늘", price: 320, svg: WALL_DAWN, swatch: "linear-gradient(180deg,#43286B,#84497A 45%,#E79E6E)" },

  // 바닥
  { id: "floor-wood", slot: "floor", name: "기본 마루", price: 0, svg: null, swatch: "linear-gradient(180deg,#241844,#160E2C)" },
  { id: "floor-check", slot: "floor", name: "체크 타일", price: 180, svg: FLOOR_CHECK, swatch: "conic-gradient(#3A2870 0 25%,#2A1C51 0 50%,#3A2870 0 75%,#2A1C51 0)" },
  { id: "floor-cloud", slot: "floor", name: "구름 바닥", price: 240, svg: FLOOR_CLOUD, swatch: "linear-gradient(180deg,#8B78D0,#312656)" },
  { id: "floor-sea", slot: "floor", name: "밤바다", price: 300, svg: FLOOR_SEA, swatch: "linear-gradient(180deg,#143C66,#0A1A38)" },

  // 러그
  { id: "rug-magic", slot: "rug", name: "마법진 러그", price: 0, svg: null, swatch: "radial-gradient(circle,#6C46C0,#4A2E93)" },
  { id: "rug-none", slot: "rug", name: "깔지 않기", price: 0, svg: "", swatch: "repeating-linear-gradient(45deg,#2a1854 0 6px,#1b1230 6px 12px)" },
  { id: "rug-star", slot: "rug", name: "별 러그", price: 220, svg: RUG_STAR, swatch: "radial-gradient(circle,#FFE9B0,#F5C263)" },
  { id: "rug-donut", slot: "rug", name: "도넛 러그", price: 260, svg: RUG_DONUT, swatch: "radial-gradient(circle,#FDF3E3 30%,#E879F9 55%,#8B5CF6)" },

  // 창문
  { id: "window-night", slot: "window", name: "밤창과 커튼", price: 0, svg: null, swatch: "linear-gradient(180deg,#7C57D6,#2E3E86)" },
  { id: "window-round", slot: "window", name: "둥근 보름달 창", price: 280, svg: WINDOW_ROUND, swatch: "radial-gradient(circle at 62% 34%,#F5D98A 18%,#3A2A6E 22%)" },
  { id: "window-none", slot: "window", name: "창문 없이", price: 0, svg: "", swatch: "linear-gradient(180deg,#38265F,#2B1C4E)" },

  // 액자
  { id: "poster-candle", slot: "poster", name: "촛불 액자", price: 0, svg: null, swatch: "radial-gradient(circle,#FFB25C 25%,#2C1E58 30%)" },
  { id: "poster-star", slot: "poster", name: "별자리 포스터", price: 200, svg: POSTER_STAR, swatch: "linear-gradient(135deg,#F5C263 0 18%,#1B1240 18%)" },
  { id: "poster-none", slot: "poster", name: "액자 없이", price: 0, svg: "", swatch: "linear-gradient(180deg,#38265F,#2B1C4E)" },

  // 선반
  { id: "shelf-potion", slot: "shelf", name: "포션 선반", price: 0, svg: null, swatch: "linear-gradient(90deg,#F472B6,#7DD3FC,#A3E635)" },
  { id: "shelf-plant", slot: "shelf", name: "화분 선반", price: 200, svg: SHELF_PLANT, swatch: "linear-gradient(180deg,#63D28C,#5B3F94)" },
  { id: "shelf-none", slot: "shelf", name: "선반 없이", price: 0, svg: "", swatch: "linear-gradient(180deg,#38265F,#2B1C4E)" },

  // 왼쪽 가구
  { id: "fl-plant", slot: "furnitureLeft", name: "별 화분", price: 0, svg: null, swatch: "linear-gradient(180deg,#9268E8,#5B4499)" },
  { id: "fl-stool", slot: "furnitureLeft", name: "별 스툴", price: 160, svg: FURN_LEFT_STOOL, swatch: "linear-gradient(180deg,#FFD84D,#7C57D6)" },
  { id: "fl-none", slot: "furnitureLeft", name: "비우기", price: 0, svg: "", swatch: "repeating-linear-gradient(45deg,#2a1854 0 6px,#1b1230 6px 12px)" },

  // 오른쪽 가구
  { id: "fr-lamp", slot: "furnitureRight", name: "램프 테이블", price: 0, svg: null, swatch: "linear-gradient(180deg,#FFD98E,#4A3684)" },
  { id: "fr-table", slot: "furnitureRight", name: "찻상", price: 240, svg: FURN_RIGHT_TABLE, swatch: "linear-gradient(180deg,#9268E8,#FDF3E3)" },
  { id: "fr-none", slot: "furnitureRight", name: "비우기", price: 0, svg: "", swatch: "repeating-linear-gradient(45deg,#2a1854 0 6px,#1b1230 6px 12px)" },
];

const BY_ID = new Map(ITEMS.map((i) => [i.id, i]));

export function itemById(id: string): DecorItem | undefined {
  return BY_ID.get(id);
}

export function itemsOfSlot(slot: SlotKey): DecorItem[] {
  return ITEMS.filter((i) => i.slot === slot);
}

/** 슬롯별 기본값 — 아무것도 안 고른 방의 모습 */
export const DEFAULT_ITEM: Record<SlotKey, string> = {
  wall: "wall-night",
  floor: "floor-wood",
  window: "window-night",
  poster: "poster-candle",
  shelf: "shelf-potion",
  rug: "rug-magic",
  furnitureLeft: "fl-plant",
  furnitureRight: "fr-lamp",
};

/** 값이 0 인 아이템은 사는 절차 없이 늘 고를 수 있다 */
export const isFree = (item: DecorItem) => item.price === 0;

export type Decor = Partial<Record<SlotKey, string>>;

/** 저장된 꾸미기 상태를 카탈로그에 있는 값만 남기고 정리한다 */
export function normalizeDecor(raw: unknown): Decor {
  const src = (raw ?? {}) as Record<string, unknown>;
  const out: Decor = {};
  for (const slot of SLOT_KEYS) {
    const id = src[slot];
    if (typeof id !== "string") continue;
    const item = BY_ID.get(id);
    // 슬롯이 어긋난 id 는 버린다 — 벽지 자리에 러그가 들어가면 방이 깨진다
    if (item && item.slot === slot && id !== DEFAULT_ITEM[slot]) out[slot] = id;
  }
  return out;
}
