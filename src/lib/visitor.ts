"use client";

/*
 * 이 브라우저의 표식.
 *
 * 로그인이 없으므로 "같은 사람" 을 알아볼 방법이 입력값밖에 없는데, 사람이 다시
 * 무언가를 남기는 이유는 대개 앞서 넣은 것을 고치거나 지우려는 것이라 입력으로는
 * 같은 사람을 못 알아본다. 그래서 무엇을 고치든 변하지 않는 임의 id 를 브라우저에
 * 심어두고 필요할 때 함께 보낸다.
 *
 * **이 값으로 사람을 식별하지 않는다.** 서버는 해시만 저장하고, 한 지도 안에서
 * 같은 줄을 찾거나(귀인지도) 방명록에서 자기 글을 지울 권한을 가리는 데만 쓴다.
 * 스토리지를 막아둔 브라우저(시크릿창 등)에서는 없는 채로 진행한다.
 *
 * 처음에는 귀인지도 전용(`lib/map/visitor.ts`)이었는데 방명록도 같은 것이
 * 필요해져 올려 두었다. 두 벌을 심으면 같은 브라우저가 화면마다 다른 사람이 된다.
 */

const VISITOR = "fortunepot-visitor";

export function visitorId(): string | undefined {
  let store: Storage;
  try {
    store = window.localStorage;
  } catch {
    return undefined; // 스토리지 차단
  }

  const saved = store.getItem(VISITOR);
  if (saved) return saved;

  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  const fresh = Array.from(bytes, (n) => n.toString(16).padStart(2, "0")).join("");
  try {
    store.setItem(VISITOR, fresh);
  } catch {
    return undefined;
  }
  return fresh;
}
