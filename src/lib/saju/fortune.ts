import type { Ohaeng } from "./constants";
import { computeSaju, sipseong, ohOfGan, ohOfJi, ohIdxOfGan, isYangGan } from "./calc";
import type { SajuResult } from "@/types/saju";

// 오늘 일간이 본명 일간에 대해 어떤 십성이 되는지에 따른 종합 점수 (1~5)
const SIP_SCORE: Record<string, number> = {
  비견: 3, 겁재: 2,
  식신: 5, 상관: 4,
  편재: 4, 정재: 5,
  편관: 2, 정관: 4,
  편인: 3, 정인: 5,
};

const CAT_SCORE: Record<"애정" | "금전" | "직장" | "건강", Record<string, number>> = {
  애정: { 식신: 5, 상관: 4, 편재: 4, 정재: 4, 편관: 3, 정관: 4, 편인: 3, 정인: 3, 비견: 3, 겁재: 2 },
  금전: { 정재: 5, 편재: 5, 식신: 4, 상관: 3, 정관: 4, 편관: 2, 정인: 3, 편인: 2, 비견: 3, 겁재: 2 },
  직장: { 정관: 5, 편관: 4, 정인: 5, 편인: 3, 식신: 4, 상관: 3, 정재: 4, 편재: 3, 비견: 3, 겁재: 2 },
  건강: { 정인: 5, 편인: 4, 식신: 4, 상관: 3, 비견: 4, 겁재: 3, 정재: 4, 편재: 3, 정관: 3, 편관: 2 },
};

const OVERALL_LINES: Record<string, string[]> = {
  비견: ["동료와 호흡이 잘 맞는 하루, 함께 움직이세요.", "주변과 보폭을 맞추면 무리 없이 흘러갑니다."],
  겁재: ["충동을 한 박자 늦추면 손해를 피해요.", "경쟁심이 일더라도 내 페이스를 지키세요."],
  식신: ["하고 싶은 일을 하면 결과가 따라오는 날.", "표현하는 즐거움이 운을 데려옵니다."],
  상관: ["재치가 빛나지만 한 박자 양보가 필요해요.", "남의 말도 끝까지 들으면 인정받습니다."],
  편재: ["변화를 받아들이면 새로운 기회가 보여요.", "활동적인 만남이 좋은 흐름을 만듭니다."],
  정재: ["꾸준히 해온 일에서 결실이 보이는 하루.", "안정적인 선택이 가장 큰 이득입니다."],
  편관: ["압박이 커도 정면 돌파보다 우회를 택하세요.", "급한 결정은 잠시 미뤄두면 좋겠어요."],
  정관: ["규칙과 약속을 지키면 신뢰가 쌓이는 날.", "책임감을 보이면 좋은 평가가 따라옵니다."],
  편인: ["혼자만의 시간이 영감을 가져다 줘요.", "기존 방식에서 살짝 비켜가 보세요."],
  정인: ["가까운 사람의 조언이 답이 되는 하루.", "배움을 시작하기에 좋은 흐름입니다."],
};

const LOVE_LINES: Record<string, string> = {
  비견: "친구 같은 편안함이 사이를 단단하게 만들어요.",
  겁재: "오해가 생기기 쉬우니 말투를 부드럽게.",
  식신: "마음 가는 대로 다정하게 표현해 보세요.",
  상관: "유머는 살리되 상대의 반응을 끝까지 들어요.",
  편재: "새로운 만남, 의외의 인연이 다가옵니다.",
  정재: "오래 함께한 인연이 더 따뜻해집니다.",
  편관: "사소한 트집보다 큰 그림을 보세요.",
  정관: "약속을 지키는 모습이 매력이 됩니다.",
  편인: "혼자만의 시간이 마음을 정리해 줘요.",
  정인: "주변의 다정한 말 한마디가 큰 위로가 됩니다.",
};

const MONEY_LINES: Record<string, string> = {
  비견: "친구와 더치페이로 깔끔히 정리해 두세요.",
  겁재: "충동구매 주의, 영수증을 꼭 챙기세요.",
  식신: "취미에 쓴 돈이 의외의 가치를 만듭니다.",
  상관: "말로 약속한 금전은 글로 남겨두세요.",
  편재: "활동적 수입의 흐름이 좋아지는 하루.",
  정재: "작게 모은 것이 빛을 발하는 날입니다.",
  편관: "갑작스러운 지출 주의, 예비비를 챙겨두세요.",
  정관: "정해진 예산 안에서 움직이면 안정적이에요.",
  편인: "장기 투자나 학습형 지출이 도움이 됩니다.",
  정인: "오래 묵혀둔 자산을 점검해 보세요.",
};

const WORK_LINES: Record<string, string> = {
  비견: "팀원과 호흡이 좋아 협업이 수월합니다.",
  겁재: "성과 다툼은 잠시 내려두는 게 이득이에요.",
  식신: "새 아이디어가 술술 풀리는 흐름.",
  상관: "발표·기획에서 빛나는 하루, 자신감 있게.",
  편재: "외부 미팅·영업이 잘 풀리는 날.",
  정재: "마무리 작업, 보고서 정리에 좋은 날.",
  편관: "상사·고객의 압박은 우회 대응이 답입니다.",
  정관: "맡은 일에 책임감 보이면 좋은 평가가 옵니다.",
  편인: "낯선 분야의 공부가 가속되는 흐름.",
  정인: "멘토의 조언이 큰 도움이 되는 하루.",
};

const HEALTH_LINES: Record<string, string> = {
  비견: "친구와 가볍게 운동하면 활력이 살아납니다.",
  겁재: "무리한 운동·과음을 피해 주세요.",
  식신: "맛있는 식사가 컨디션을 데려옵니다.",
  상관: "말 많은 자리 후 목·어깨 피로 주의.",
  편재: "활동량을 늘리면 몸이 가벼워져요.",
  정재: "규칙적인 식사·수면이 가장 큰 보약.",
  편관: "스트레스가 쌓이니 깊은 호흡을 자주.",
  정관: "정해진 루틴을 지키면 컨디션이 안정적.",
  편인: "혼자 산책하며 머리를 비워보세요.",
  정인: "충분한 휴식이 내일의 운을 채웁니다.",
};

const ADVICE_LINES: Record<string, string> = {
  비견: "혼자 끙끙대지 말고 곁의 사람과 나누세요. 함께가 답입니다.",
  겁재: "조급함을 내려놓고 내 페이스를 지키세요. 빠르다고 이긴 게 아닙니다.",
  식신: "마음이 향하는 곳으로 한 걸음, 그것이 오늘의 정답입니다.",
  상관: "말보다 듣는 시간이 운을 데려옵니다.",
  편재: "기회를 잡고 싶다면 먼저 손을 내미세요.",
  정재: "오늘 하루의 작은 정성이 큰 결실로 돌아옵니다.",
  편관: "맞서기보다 흘려보내는 지혜가 필요한 날입니다.",
  정관: "약속과 원칙을 지키는 것만으로 충분합니다.",
  편인: "익숙함에서 한 발 떨어져 자신을 들여다보세요.",
  정인: "조언을 청해도 좋은 날입니다. 마음을 열어두세요.",
};

const SIP_MOOD: Record<string, string> = {
  비견: "base", 겁재: "base",
  식신: "mischief", 상관: "mischief",
  편재: "star", 정재: "star",
  편관: "dream", 정관: "dream",
  편인: "love", 정인: "love",
};

// 보충해야 할 오행(본명 가장 약한 오행)에 따른 행운의 색/아이템
const OH_LUCKY_COLORS: Record<Ohaeng, [string, string]> = {
  목: ["연두", "#86efac"],
  화: ["코랄", "#fb7185"],
  토: ["황토", "#d97706"],
  금: ["은백", "#e5e7eb"],
  수: ["네이비", "#1e3a8a"],
};

const OH_LUCKY_ITEMS: Record<Ohaeng, string[]> = {
  목: ["작은 화분", "원목 소품", "녹차 한 잔"],
  화: ["향초", "따뜻한 차", "붉은 액세서리"],
  토: ["흙빛 머그", "도자기 소품", "노란 손수건"],
  금: ["은 액세서리", "메탈 펜", "흰 노트"],
  수: ["유리병 음료", "파란 손수건", "텀블러"],
};

const GRADE = ["흉", "주의", "평", "길", "대길"];

function fnv1a(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
const pick = <T,>(arr: T[], s: number): T => arr[s % arr.length];
export const stars = (n: number) => "★★★★★".slice(0, n) + "☆☆☆☆☆".slice(0, 5 - n);

export interface FortuneCategory { key: string; icon: string; score: number; line: string; }
export interface Fortune {
  dateLabel: string;
  score: number;
  grade: string;
  overall: string;
  categories: FortuneCategory[];
  color: [string, string];
  number: number;
  item: string;
  advice: string;
  moodKey: string;
}

function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function countOhaeng(s: SajuResult): Record<Ohaeng, number> {
  const c: Record<Ohaeng, number> = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
  const add = (g: number, z: number) => { c[ohOfGan(g)]++; c[ohOfJi(z)]++; };
  add(s.year[0], s.year[1]);
  add(s.month[0], s.month[1]);
  add(s.day[0], s.day[1]);
  if (s.hour) add(s.hour[0], s.hour[1]);
  return c;
}

function weakestOh(c: Record<Ohaeng, number>): Ohaeng {
  let min: Ohaeng = "목"; let v = Infinity;
  (Object.keys(c) as Ohaeng[]).forEach((k) => { if (c[k] < v) { v = c[k]; min = k; } });
  return min;
}
function strongestOh(c: Record<Ohaeng, number>): Ohaeng {
  let max: Ohaeng = "목"; let v = -1;
  (Object.keys(c) as Ohaeng[]).forEach((k) => { if (c[k] > v) { v = c[k]; max = k; } });
  return max;
}

/**
 * 사주(본명 일간) × 오늘 일주의 십성 관계를 기반으로 일일 운세를 생성한다.
 * 본명의 오행 분포로 보충 색·아이템을 정하고, 오늘 오행이 본명 약/강 오행과 일치하면 ±1 보정한다.
 */
export function generateFortune(saju: SajuResult, name: string, date = new Date()): Fortune {
  const today = computeSaju(ymd(date), null);
  const todayGan = today.day[0];
  const todayZhi = today.day[1];

  const sip = sipseong(
    ohIdxOfGan(saju.ilgan),
    isYangGan(saju.ilgan),
    ohIdxOfGan(todayGan),
    isYangGan(todayGan),
  );

  const counts = countOhaeng(saju);
  const weak = weakestOh(counts);
  const strong = strongestOh(counts);
  const todayOh = ohOfGan(todayGan);

  let sc = SIP_SCORE[sip] ?? 3;
  if (todayOh === weak) sc += 1;      // 부족한 기운을 보충
  else if (todayOh === strong) sc -= 1; // 이미 강한 기운이 더 강해짐
  sc = Math.max(1, Math.min(5, sc));

  const s = fnv1a(name + ymd(date));
  const overall = pick(OVERALL_LINES[sip], s);
  const item = pick(OH_LUCKY_ITEMS[weak], s >>> 8);

  const categories: FortuneCategory[] = [
    { key: "애정운",       icon: "💕", score: CAT_SCORE.애정[sip], line: LOVE_LINES[sip] },
    { key: "금전운",       icon: "💰", score: CAT_SCORE.금전[sip], line: MONEY_LINES[sip] },
    { key: "직장·학업운", icon: "📚", score: CAT_SCORE.직장[sip], line: WORK_LINES[sip] },
    { key: "건강운",       icon: "🌿", score: CAT_SCORE.건강[sip], line: HEALTH_LINES[sip] },
  ];

  // 행운 숫자: 오늘 일주(천간+지지) 기반
  const number = ((todayGan + todayZhi) % 9) + 1;

  const d = date;
  const dateLabel = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} (${"일월화수목금토"[d.getDay()]})`;

  return {
    dateLabel,
    score: sc,
    grade: GRADE[sc - 1],
    overall,
    categories,
    color: OH_LUCKY_COLORS[weak],
    number,
    item,
    advice: ADVICE_LINES[sip],
    moodKey: SIP_MOOD[sip],
  };
}
