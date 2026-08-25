import { cache } from "react";
import type { Metadata } from "next";
import TopBar from "@/components/TopBar";
import GuestbookPanel from "@/components/game/GuestbookPanel";
import RoomStage from "@/components/game/RoomStage";
import RoomVisitCta from "@/components/game/RoomVisitCta";
import { ELEMENTS } from "@/lib/game/elements";
import { loadCharacterSvg, loadRoomSvg } from "@/lib/game/loadSvg";
import { getRoom, listGuestbook } from "@/lib/game/store";
import type { GuestEntry, RoomView } from "@/lib/game/types";
import { KvUnavailable, logKvUnavailable } from "@/lib/kv";

/*
 * 공유 링크로 들어오는 방.
 *
 * 읽기 전용이다. 링크에 담긴 건 publicId 뿐이고 그걸로는 고칠 수 없다 —
 * 꾸미기·포인트는 주인 열쇠(브라우저 localStorage)가 있어야 한다.
 *
 * 여기서는 원소를 서버가 알고 있으므로 캐릭터를 **한 벌만** 인라인한다.
 * (내 방 화면이 다섯 벌을 다 내려보내는 사정은 `lib/game/loadSvg.ts` 주석에)
 *
 * 방명록이 즉시 반영돼야 해서 캐시를 두지 않는다.
 */
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ publicId: string }> };

/**
 * generateMetadata 와 본문이 같은 방을 각각 한 번씩 읽는다. 그대로 두면 링크를
 * 열 때마다 KV 왕복이 두 배로 든다 — cache 로 감싸 한 요청 안에서는 처음 것만
 * 실제로 나가게 한다(지도 공유 페이지와 같은 방식).
 */
const fetchRoom = cache(async (id: string): Promise<RoomView | "down" | null> => {
  try {
    return await getRoom(id, null);
  } catch (e) {
    if (e instanceof KvUnavailable) {
      logKvUnavailable();
      return "down";
    }
    return null;
  }
});

const fetchBook = cache(async (id: string): Promise<GuestEntry[]> => {
  try {
    return await listGuestbook(id);
  } catch {
    return [];
  }
});

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const room = await fetchRoom((await params).publicId);
  if (!room || room === "down") {
    return { title: "포춘팟 내 방", description: "사주 캐릭터가 사는 나만의 방" };
  }
  const meta = ELEMENTS[room.element];
  const who = room.nickname ? `${room.nickname}님` : "누군가";
  const title = `${who}의 방에 놀러오세요`;
  const description = `${meta.ohaeng}(${meta.hanja}) ${meta.name}가 사는 방이에요. 방명록도 남길 수 있어요.`;
  return { title, description, openGraph: { title, description } };
}

export default async function SharedRoomPage({ params }: Params) {
  const { publicId } = await params;
  const room = await fetchRoom(publicId);

  if (!room || room === "down") {
    return (
      <section className="screen">
        <TopBar home menu />
        <div className="scroll">
          <div className="room-card">
            {room === "down" ? (
              <p>
                방 보관소에 연결하지 못했어요.
                <br />
                잠시 후 다시 시도해 주세요.
              </p>
            ) : (
              <p>
                방을 찾을 수 없어요.
                <br />
                링크가 만료되었거나 주소가 잘못됐을 수 있어요.
              </p>
            )}
            <a className="btn primary block focusable" href="/my-room">
              내 방 만들기
            </a>
          </div>
        </div>
      </section>
    );
  }

  const meta = ELEMENTS[room.element];
  const ownerName = room.nickname ?? "누군가";
  const [roomMarkup, characterMarkup, entries] = await Promise.all([
    loadRoomSvg("front"),
    loadCharacterSvg(room.element),
    fetchBook(publicId),
  ]);

  return (
    <section className="screen">
      <TopBar home menu />
      <div className="scroll">
        <div className="room-screen">
          <div className="room-head">
            <h1 className="room-title">
              <b>{ownerName}</b>님의 방
            </h1>
            <span className="el-badge" data-element={room.element}>
              {meta.ohaeng}({meta.hanja}) {meta.name}
            </span>
          </div>

          {/* 방명록 창은 무대 바깥에 붙는다 — 무대가 overflow 를 자르기 때문 */}
          <div className="room-frame">
            <RoomStage
              element={room.element}
              roomMarkup={roomMarkup}
              characterMarkup={characterMarkup}
              decor={room.decor}
              hint="캐릭터를 눌러보세요"
            />
            {/*
              첫 목록은 서버가 그려 보낸다. 공유 링크는 미리보기·검색으로도 열리므로
              내용이 HTML 안에 있어야 하고, 열자마자 바로 보여야 한다.
            */}
            <GuestbookPanel publicId={publicId} initial={entries} ownerName={ownerName} />
          </div>

          <RoomVisitCta publicId={publicId} ownerName={ownerName} />

          <p className="room-note">
            방에는 캐릭터와 꾸민 모습만 보여요.
            <br />
            생년월일은 주인의 기기에만 있고 아무에게도 보이지 않아요.
          </p>
        </div>
      </div>
    </section>
  );
}
