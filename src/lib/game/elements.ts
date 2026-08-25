import { ohOfGan } from "@/lib/saju/calc";
import type { Ohaeng } from "@/lib/saju/constants";

/*
 * 오행 캐릭터 메타 — 방에 세울 다섯 캐릭터의 단일 출처.
 *
 * 게임킷은 천간 한자(甲·乙…)로 오행을 찾는 표를 함께 들고 왔지만, 이 저장소에는
 * 이미 같은 표가 `lib/saju/constants.ts` 의 CG_OH 로 있다. 표가 두 벌이면 한쪽만
 * 고쳐지는 날이 오므로 여기서는 명식 계산 결과(일간 인덱스)를 그대로 받는다.
 */

export const ELEMENT_KEYS = ["fire", "water", "wood", "metal", "earth"] as const;
export type ElementKey = (typeof ELEMENT_KEYS)[number];

export interface ElementMeta {
  key: ElementKey;
  /** 앱의 나머지 화면이 쓰는 한글 오행 — 뱃지·문구를 같은 말로 맞춘다 */
  ohaeng: Ohaeng;
  hanja: string;
  /** 캐릭터 이름 */
  name: string;
  /** 성정 한 줄 */
  trait: string;
  /** 대표색 — 뱃지·글로우에 재사용(game.css 의 --fp-* 와 같은 값) */
  color: string;
  /** 점프 애니메이션 길이(ms). 보상 연출을 이어 붙일 때 참고 */
  popDurationMs: number;
}

export const ELEMENTS: Record<ElementKey, ElementMeta> = {
  fire: {
    key: "fire",
    ohaeng: "화",
    hanja: "火",
    name: "부리",
    trait: "열정·호기로움",
    color: "#FF8072",
    popDurationMs: 900,
  },
  water: {
    key: "water",
    ohaeng: "수",
    hanja: "水",
    name: "포로",
    trait: "지혜·유연·차분",
    color: "#5AA8F5",
    popDurationMs: 1150,
  },
  wood: {
    key: "wood",
    ohaeng: "목",
    hanja: "木",
    name: "새싹",
    trait: "성장·호기심",
    color: "#63D28C",
    popDurationMs: 980,
  },
  metal: {
    key: "metal",
    ohaeng: "금",
    hanja: "金",
    name: "차랑",
    trait: "결단·의리·냉철",
    color: "#E4EAF6",
    popDurationMs: 640,
  },
  earth: {
    key: "earth",
    ohaeng: "토",
    hanja: "土",
    name: "도담",
    trait: "안정·포용·느긋",
    color: "#F5C263",
    popDurationMs: 1020,
  },
};

export const ELEMENT_LIST = ELEMENT_KEYS.map((k) => ELEMENTS[k]);

const OH_TO_ELEMENT: Record<Ohaeng, ElementKey> = {
  목: "wood",
  화: "fire",
  토: "earth",
  금: "metal",
  수: "water",
};

/**
 * 캐릭터는 **일간(日干)** 으로 정한다.
 *
 * 오행 개수가 가장 많은 것으로 정하면 "나"가 아니라 "내가 처한 환경"을 캐릭터로
 * 만들게 된다. 사주에서 나 자신을 뜻하는 글자는 일간이므로 그쪽을 쓴다.
 * 오행 분포는 나중에 방 테마색 같은 보조 연출로 쓸 여지가 남아 있다.
 */
export function elementOfIlgan(ilgan: number): ElementKey {
  return OH_TO_ELEMENT[ohOfGan(ilgan)];
}

export function isElementKey(v: unknown): v is ElementKey {
  return typeof v === "string" && (ELEMENT_KEYS as readonly string[]).includes(v);
}
