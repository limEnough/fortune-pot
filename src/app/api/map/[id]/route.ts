import { NextResponse } from "next/server";
import { getMap, removeMember } from "@/lib/map/store";
import { fail } from "../_fail";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/** GET /api/map/{id}?key=  또는 ?visitor= — 주인이거나 이름을 올린 사람만 */
export async function GET(req: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const q = new URL(req.url).searchParams;
    return NextResponse.json(await getMap(id, q.get("key"), q.get("visitor")));
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
