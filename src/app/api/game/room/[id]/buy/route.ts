import { NextResponse } from "next/server";
import { buyItem } from "@/lib/game/store";
import { fail, ownerOf } from "../../../_fail";

export const dynamic = "force-dynamic";

/**
 * POST /api/game/room/{id}/buy — 아이템 구매 (주인만)
 *
 * 잔액은 서버가 셈한다. 브라우저가 보내는 값은 어떤 아이템인지뿐이고,
 * 가격은 코드에 있는 카탈로그에서 가져온다.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    return NextResponse.json(await buyItem(id, ownerOf(req), await req.json()));
  } catch (e) {
    return fail(e);
  }
}
