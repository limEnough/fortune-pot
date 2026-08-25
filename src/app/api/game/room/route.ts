import { NextResponse } from "next/server";
import { createRoom } from "@/lib/game/store";
import { fail } from "../_fail";

export const dynamic = "force-dynamic";

/** POST /api/game/room — 내 방을 새로 만든다 */
export async function POST(req: Request) {
  try {
    return NextResponse.json(await createRoom(await req.json()));
  } catch (e) {
    return fail(e);
  }
}
