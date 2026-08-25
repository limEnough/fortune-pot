/*
 * 서버 API 를 부르는 한 가지 방법.
 *
 * 서버는 실패를 늘 `{ message }` 로 돌려준다(`api/map/_fail.ts`, `api/game/_fail.ts`).
 * 그 문장이 그대로 화면에 뜨는 말이라, 여기서 Error 에 옮겨 담아 부르는 쪽이
 * catch 한 번으로 끝내게 한다.
 *
 * 처음엔 지도 화면 세 곳이 각자 fetch 를 풀어 쓰다 응답을 읽는 방식이 갈렸다 —
 * 한쪽은 던지고 한쪽은 상태에 넣고, no-store 를 빠뜨린 곳도 있었다. 지도도 방도
 * 다른 사람이 방금 남긴 게 바로 보여야 하는 화면이라 캐시를 끄는 건 선택이 아니다.
 *
 * 소유권이 필요한 호출(내 방 고치기)은 `headers` 로 열쇠를 얹는다. 열쇠를 쿼리에
 * 두지 않는 건 주소창·리퍼러·서버 로그에 남기지 않기 위해서다.
 */

interface Options {
  headers?: HeadersInit;
  fallback?: string;
}

async function ask<T>(url: string, init: RequestInit, fallback: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store", ...init });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((body as { message?: string }).message ?? fallback);
  return body as T;
}

const json = (data: unknown, headers?: HeadersInit): RequestInit => ({
  headers: { "Content-Type": "application/json", ...headers },
  body: JSON.stringify(data),
});

/** GET — 실패하면 서버가 준 문장을 담은 Error 를 던진다 */
export function apiGet<T>(url: string, o: Options | string = {}): Promise<T> {
  const opt = typeof o === "string" ? { fallback: o } : o;
  return ask<T>(url, { headers: opt.headers }, opt.fallback ?? "요청에 실패했어요.");
}

/** POST(JSON) — 헤더와 직렬화는 여기서 한 번만 쓴다 */
export function apiPost<T>(url: string, data: unknown, o: Options | string = {}): Promise<T> {
  const opt = typeof o === "string" ? { fallback: o } : o;
  return ask<T>(
    url,
    { method: "POST", ...json(data, opt.headers) },
    opt.fallback ?? "요청에 실패했어요.",
  );
}

/** PATCH(JSON) — 이미 있는 것을 고친다 */
export function apiPatch<T>(url: string, data: unknown, o: Options | string = {}): Promise<T> {
  const opt = typeof o === "string" ? { fallback: o } : o;
  return ask<T>(
    url,
    { method: "PATCH", ...json(data, opt.headers) },
    opt.fallback ?? "요청에 실패했어요.",
  );
}

/** DELETE — 돌려받을 게 없어 성공 여부만 본다 */
export function apiDelete(url: string, o: Options | string = {}): Promise<unknown> {
  const opt = typeof o === "string" ? { fallback: o } : o;
  return ask<unknown>(
    url,
    { method: "DELETE", headers: opt.headers },
    opt.fallback ?? "요청에 실패했어요.",
  );
}
