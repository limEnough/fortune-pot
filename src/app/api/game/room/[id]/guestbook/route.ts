import { NextResponse } from "next/server";
import {
  addGuestbook,
  authorHashOf,
  listGuestbook,
  removeGuestbook,
  visitorHashOf,
} from "@/lib/game/store";
import { fail, ownerOf } from "../../../_fail";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/** GET /api/game/room/{id}/guestbook — 방명록 목록 (누구나) */
export async function GET(_req: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    return NextResponse.json({ entries: await listGuestbook(id) });
  } catch (e) {
    return fail(e);
  }
}

/**
 * POST /api/game/room/{id}/guestbook — 글 남기기 (누구나, 로그인 없이)
 *
 * 한 방에 하루 한 줄입니다. 자물쇠는 브라우저 표식으로 걸고, 표식을 갈아가며
 * 퍼붓는 경우까지는 IP 해시로 짧게 막습니다. 원본 IP 도 원본 표식도 저장하지
 * 않습니다 — 필요한 건 "같은 사람인가" 뿐이라 해시로 충분합니다.
 */
export async function POST(req: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const body = (await req.json()) as { visitor?: unknown };
    const entry = await addGuestbook(id, body, authorHashOf(req), visitorHashOf(body.visitor));
    return NextResponse.json({ entry });
  } catch (e) {
    return fail(e);
  }
}

/**
 * DELETE /api/game/room/{id}/guestbook?entry=&visitor= — 한 줄 지우기
 *
 * 방 주인(`x-fp-owner`)과 글쓴이 본인(브라우저 표식) 둘 다 지울 수 있습니다.
 */
export async function DELETE(req: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const q = new URL(req.url).searchParams;
    await removeGuestbook(
      id,
      ownerOf(req),
      q.get("entry") ?? "",
      visitorHashOf(q.get("visitor")),
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    return fail(e);
  }
}
