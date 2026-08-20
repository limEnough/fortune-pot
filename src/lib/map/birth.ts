/**
 * 달력에 실제로 있는 날인지.
 *
 * Date 는 2월 30일 같은 값을 조용히 다음 달로 넘겨버려서, 넘어갔는지는 만든 뒤
 * 되읽어 확인하는 수밖에 없다. 아래끝(1900년)과 위끝(아직 오지 않은 날)도 함께
 * 본다 — 만세력이 닿는 범위이고, 앞날은 생일일 수 없다.
 *
 * 폼(여기)과 서버(map/store 의 normalizeJoin)가 같은 판정을 각자 적고 있었다.
 * 둘이 갈리면 화면은 받아주는데 서버가 되돌려보내는 값이 생긴다.
 */
export function isRealBirth(y: number, m: number, d: number): boolean {
  const dt = new Date(y, m - 1, d);
  return (
    dt.getFullYear() === y &&
    dt.getMonth() === m - 1 &&
    dt.getDate() === d &&
    y >= 1900 &&
    dt.getTime() <= Date.now()
  );
}

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

  if (!isRealBirth(y, m, d)) return null;

  const p2 = (n: number) => String(n).padStart(2, "0");
  return `${y}-${p2(m)}-${p2(d)}`;
}
