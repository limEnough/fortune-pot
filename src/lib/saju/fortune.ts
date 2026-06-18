const OVERALL = [
  "흐름을 거스르지 않으면 일이 술술 풀리는 날이에요.",
  "작은 결정이 큰 차이를 만드는 하루. 직감을 믿어보세요.",
  "주변의 도움이 생각지 못한 행운으로 돌아옵니다.",
  "서두르지 않아도 좋아요. 천천히 가도 도착하는 날.",
];
const LOVE = ["먼저 건넨 말 한마디가 관계를 데웁니다.","오래 미룬 연락을 보내기 좋은 타이밍.","상대의 작은 변화를 알아채면 사이가 깊어져요."];
const MONEY = ["충동구매만 피하면 지갑이 든든한 하루.","예상 밖의 지출 주의, 영수증을 챙기세요.","작게 모은 것이 빛을 발하는 날이에요."];
const WORK = ["집중력이 좋은 날, 미뤄둔 일을 끝내기 좋아요.","협업에서 좋은 평가를 얻습니다.","새 아이디어를 메모해 두면 곧 쓰임이 생겨요."];
const HEALTH = ["가벼운 산책이 컨디션을 끌어올립니다.","수분을 충분히, 눈의 피로를 덜어주세요.","충분한 휴식이 내일의 운을 채웁니다."];
const COLOR: [string, string][] = [["라벤더","#a78bfa"],["딥퍼플","#6d3fd4"],["연보라","#c4b5fd"],["자수정","#9333ea"]];
const ITEM = ["손목시계","작은 노트","따뜻한 차","향초","이어폰"];
const ADVICE = [
  "오늘은 '완벽'보다 '시작'에 마음을 두세요. 한 걸음이면 충분합니다.",
  "마음이 향하는 쪽으로 가도 괜찮은 날이에요. 자신을 조금 더 믿어보세요.",
  "주는 만큼 돌아오는 하루. 가까운 사람에게 다정함을 먼저 건네보세요.",
];

export function seed(str: string): number {
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

const MOODS = ["base", "star", "love", "mischief", "dream"];

export function generateFortune(name: string, date = new Date()): Fortune {
  const s = seed(name + date.toDateString());
  const sc = 3 + (s % 3);
  const overall = pick(OVERALL, s);
  const categories: FortuneCategory[] = [
    { key: "애정운", icon: "💕", score: 3 + ((s >>> 2) % 3), line: pick(LOVE, s >>> 2) },
    { key: "금전운", icon: "💰", score: 3 + ((s >>> 4) % 3), line: pick(MONEY, s >>> 4) },
    { key: "직장·학업운", icon: "📚", score: 3 + ((s >>> 6) % 3), line: pick(WORK, s >>> 6) },
    { key: "건강운", icon: "🌿", score: 3 + ((s >>> 8) % 3), line: pick(HEALTH, s >>> 8) },
  ];
  const grade = overall.includes("술술") || sc === 5 ? "대길" : sc === 4 ? "길" : "평";
  const d = date;
  const dateLabel = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} (${"일월화수목금토"[d.getDay()]})`;
  return {
    dateLabel, score: sc, grade, overall, categories,
    color: pick(COLOR, s >>> 10), number: (s % 9) + 1, item: pick(ITEM, s >>> 12),
    advice: pick(ADVICE, s >>> 3), moodKey: MOODS[(s >>> 5) % MOODS.length],
  };
}
