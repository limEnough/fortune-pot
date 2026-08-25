import { NextResponse } from "next/server";
import { KvUnavailable, logKvUnavailable } from "@/lib/kv";
import { RoomError } from "@/lib/game/store";

/**
 * 방 라우트 다섯 개가 같은 방식으로 실패를 말한다.
 *
 * 메시지는 그대로 화면에 뜨는 문장이라 사용자 말투로 쓴다. 다만 KV 설정이
 * 빠진 건 사용자가 어쩔 수 없는 일이라 원인은 서버 로그에만 남긴다
 * (지도 쪽 `api/map/_fail.ts` 와 같은 기조 · 안내 문장만 다르다).
 */
export function fail(e: unknown) {
  if (e instanceof RoomError) {
    return NextResponse.json({ message: e.message }, { status: e.status });
  }
  if (e instanceof KvUnavailable) {
    logKvUnavailable();
    return NextResponse.json(
      { message: "방 보관소에 연결하지 못했어요. 잠시 후 다시 시도해 주세요." },
      { status: 503 },
    );
  }
  console.error("[game]", e);
  return NextResponse.json(
    { message: "문제가 생겼어요. 잠시 후 다시 시도해 주세요." },
    { status: 500 },
  );
}

/** 주인 열쇠는 헤더로 받는다 — 주소창·리퍼러·서버 로그에 남지 않게 */
export const ownerOf = (req: Request) => req.headers.get("x-fp-owner");
