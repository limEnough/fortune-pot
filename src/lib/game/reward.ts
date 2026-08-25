/*
 * 출석 보상 — 오늘의 운세를 열어보면 포인트가 들어온다.
 *
 * 설계 원칙
 *   1) 결정론적. (방 id + 날짜) 를 시드로 쓴다 → 새로고침해서 다시 굴려 큰 값을
 *      노리는 일이 불가능하다. 값이 이미 정해져 있으니 다시 굴릴 게 없다.
 *   2) 동형. 브라우저의 낙관적 표시와 서버의 지급이 같은 함수를 쓴다 →
 *      화면에 뜬 금액과 실제로 들어간 금액이 어긋날 수 없다.
 *   3) 하루 한 번은 서버가 강제한다(`game:reward:{id}:{날짜}` 를 NX 로 세운다).
 *      계산이 결정론적이어도 지급 횟수는 별개 문제라서다.
 */

export const REWARD_TABLE = [
  { points: 30, weight: 40 },
  { points: 50, weight: 30 },
  { points: 100, weight: 18 },
  { points: 200, weight: 9 },
  { points: 500, weight: 3 },
] as const;

const TOTAL_WEIGHT = REWARD_TABLE.reduce((sum, r) => sum + r.weight, 0); // 100

/** 기대값 87P/일 — 아이템 가격은 이 값을 기준으로 잡혀 있다(첫 아이템 약 이틀) */
export const EXPECTED_DAILY =
  REWARD_TABLE.reduce((sum, r) => sum + r.points * r.weight, 0) / TOTAL_WEIGHT;

/** cyrb53 — 짧고 분포가 고른 문자열 해시 */
function hash(input: string): number {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < input.length; i += 1) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

/** Asia/Seoul 기준 오늘(YYYY-MM-DD) — 자정 롤오버를 서버·브라우저가 같게 본다 */
export function seoulDateKey(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** (방 id, 날짜) 조합에는 늘 같은 금액이 나온다 */
export function rollDailyReward(roomId: string, dateKey = seoulDateKey()): number {
  const roll = hash(`${roomId}:${dateKey}`) % TOTAL_WEIGHT;
  let cursor = 0;
  for (const row of REWARD_TABLE) {
    cursor += row.weight;
    if (roll < cursor) return row.points;
  }
  return REWARD_TABLE[0].points;
}

/** 다음 지급까지 남은 시간(ms) — "내일 또 만나요" 안내에 쓴다 */
export function msUntilNextReward(now: Date = new Date()): number {
  const seoulNow = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
  const nextMidnight = new Date(seoulNow);
  nextMidnight.setHours(24, 0, 0, 0);
  return nextMidnight.getTime() - seoulNow.getTime();
}
