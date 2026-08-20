/*
 * 지도 API 를 부르는 한 가지 방법.
 *
 * 서버는 실패를 늘 `{ message }` 로 돌려준다(api/map/_fail.ts). 그 문장이 그대로
 * 화면에 뜨는 말이라, 여기서 Error 에 옮겨 담아 부르는 쪽이 catch 한 번으로
 * 끝내게 한다.
 *
 * 세 화면(내 지도·합류·남의 지도)이 각자 fetch 를 풀어 쓰다 보니 응답을 읽는
 * 방식이 조금씩 갈렸다 — 한쪽은 던지고 한쪽은 상태에 넣고, no-store 를 빠뜨린
 * 곳도 있었다. 지도는 친구가 방금 올린 줄이 바로 보여야 하는 화면이라 캐시를
 * 끄는 건 선택이 아니다.
 */

async function ask<T>(url: string, init?: RequestInit, fallback = "요청에 실패했어요."): Promise<T> {
  const res = await fetch(url, { cache: "no-store", ...init });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((body as { message?: string }).message ?? fallback);
  return body as T;
}

/** GET — 실패하면 서버가 준 문장을 담은 Error 를 던진다 */
export function apiGet<T>(url: string, fallback?: string): Promise<T> {
  return ask<T>(url, undefined, fallback);
}

/** POST(JSON) — 헤더와 직렬화는 여기서 한 번만 쓴다 */
export function apiPost<T>(url: string, data: unknown, fallback?: string): Promise<T> {
  return ask<T>(
    url,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
    fallback,
  );
}

/** DELETE — 돌려받을 게 없어 성공 여부만 본다 */
export function apiDelete(url: string, fallback?: string): Promise<unknown> {
  return ask<unknown>(url, { method: "DELETE" }, fallback);
}
