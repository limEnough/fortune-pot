import { NextResponse } from "next/server";
import { KvUnavailable } from "@/lib/kv";
import { MapError } from "@/lib/map/store";

/**
 * 라우트 네 개가 같은 방식으로 실패를 말한다.
 *
 * 메시지는 그대로 화면에 뜨는 문장이라 사용자 말투로 쓴다. 다만 KV 설정이
 * 빠진 건 사용자가 어쩔 수 없는 일이라, 원인은 서버 로그에만 남긴다.
 */
export function fail(e: unknown) {
  if (e instanceof MapError) {
    return NextResponse.json({ message: e.message }, { status: e.status });
  }
  if (e instanceof KvUnavailable) {
    console.error("[map] KV 환경변수가 없습니다 — Vercel 프로젝트에 KV 를 연결하세요.");
    return NextResponse.json(
      { message: "지도 보관소에 연결하지 못했어요. 잠시 후 다시 시도해 주세요." },
      { status: 503 },
    );
  }
  console.error("[map]", e);
  return NextResponse.json(
    { message: "문제가 생겼어요. 잠시 후 다시 시도해 주세요." },
    { status: 500 },
  );
}
