import { NextResponse } from "next/server";
import { joinMap } from "@/lib/map/store";
import { fail } from "../../_fail";

export const dynamic = "force-dynamic";

/** POST /api/map/{id}/join — 공유 링크로 들어온 사람이 이름을 올린다 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    return NextResponse.json(await joinMap(id, body));
  } catch (e) {
    return fail(e);
  }
}
