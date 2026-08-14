import { NextResponse } from "next/server";
import { createMap } from "@/lib/map/store";
import { fail } from "./_fail";

export const dynamic = "force-dynamic";

/** POST /api/map — 내 귀인지도를 새로 만든다 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    return NextResponse.json(await createMap(body));
  } catch (e) {
    return fail(e);
  }
}
