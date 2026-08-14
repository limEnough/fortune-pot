/**
 * 숫자만 받은 생년월일을 "YYYY-MM-DD" 로 만든다.
 *
 * 귀인지도는 캘린더 대신 여섯 자리(930821)를 받는다. 지도에 이름을 올리는 건
 * 대부분 남의 링크를 눌러 들어온 사람이라, 한 칸에 숫자만 두드리고 끝나는 쪽이
 * 이탈이 적다. 여덟 자리(19930821)도 그대로 받는다.
 *
 * 두 자리 연도는 올해를 기준으로 가른다 — 26 은 2026 이 아직 오지 않았다면
 * 1926 이 아니라 2026 으로 읽는 게 자연스럽다(생일이 미래면 어차피 걸러진다).
 */
export function parseBirthDigits(raw: string): string | null {
  const s = raw.replace(/\D/g, "");
  let y: number, m: number, d: number;

  if (s.length === 8) {
    y = +s.slice(0, 4); m = +s.slice(4, 6); d = +s.slice(6, 8);
  } else if (s.length === 6) {
    const yy = +s.slice(0, 2);
    const pivot = new Date().getFullYear() % 100;
    y = yy <= pivot ? 2000 + yy : 1900 + yy;
    m = +s.slice(2, 4); d = +s.slice(4, 6);
  } else {
    return null;
  }

  const dt = new Date(y, m - 1, d);
  const real = dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
  if (!real || y < 1900 || dt.getTime() > Date.now()) return null;

  const p2 = (n: number) => String(n).padStart(2, "0");
  return `${y}-${p2(m)}-${p2(d)}`;
}
