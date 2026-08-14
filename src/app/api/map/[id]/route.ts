import { NextResponse } from "next/server";
import { getMap, removeMember } from "@/lib/map/store";
import { fail } from "../_fail";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/** GET /api/map/{id}?key= — 주인이 보는 내 지도 */
export async function GET(req: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const key = new URL(req.url).searchParams.get("key");
    return NextResponse.json(await getMap(id, key));
  } catch (e) {
    return fail(e);
  }
}

/** DELETE /api/map/{id}?key=&member= — 지도에서 한 명 지우기 */
export async function DELETE(req: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const q = new URL(req.url).searchParams;
    const member = q.get("member") ?? "";
    await removeMember(id, q.get("key"), member);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return fail(e);
  }
}
