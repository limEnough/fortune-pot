import { NextResponse } from "next/server";
import { claimReward } from "@/lib/game/store";
import { fail, ownerOf } from "../../../_fail";

export const dynamic = "force-dynamic";

/**
 * POST /api/game/room/{id}/reward — 출석 보상 (주인만)
 *
 * 금액은 (방 id + 서울 날짜) 로 이미 정해져 있고 하루 한 번만 들어간다.
 * 그래서 연타하거나 새로고침해도 결과가 달라지지 않는다 —
 * 이미 받은 뒤라면 `granted: false` 에 같은 금액이 실려 돌아온다.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    return NextResponse.json(await claimReward(id, ownerOf(req)));
  } catch (e) {
    return fail(e);
  }
}
