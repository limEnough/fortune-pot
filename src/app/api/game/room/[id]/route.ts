import { NextResponse } from "next/server";
import { getRoom, patchRoom } from "@/lib/game/store";
import { fail, ownerOf } from "../../_fail";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/**
 * GET /api/game/room/{id} — 방 한 칸.
 * 링크만 있으면 누구나 볼 수 있고, 열쇠(`x-fp-owner`)가 맞으면 포인트와
 * 보유 아이템까지 함께 내려간다.
 */
export async function GET(req: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    return NextResponse.json(await getRoom(id, ownerOf(req)));
  } catch (e) {
    return fail(e);
  }
}

/** PATCH /api/game/room/{id} — 꾸미기·별명 저장 (주인만) */
export async function PATCH(req: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    return NextResponse.json(await patchRoom(id, ownerOf(req), await req.json()));
  } catch (e) {
    return fail(e);
  }
}
