import type { Metadata } from "next";
import { KvUnavailable } from "@/lib/kv";
import { getIntro } from "@/lib/map/store";
import type { MapIntro } from "@/lib/map/types";
import TopBar from "@/components/TopBar";
import JoinPanel from "@/components/map/JoinPanel";

/*
 * 공유 링크로 들어오는 화면.
 *
 * 주인 이름을 서버에서 미리 읽어 제목에 박아둔다 — 카카오톡·메시지에 링크를
 * 붙였을 때 "나는 OO님에게 어떤 사람일까?" 가 그대로 미리보기로 뜬다.
 * 링크에 담긴 건 지도 id 뿐이고, 주인의 생년월일은 서버 밖으로 나가지 않는다.
 */

type Params = { params: Promise<{ id: string }> };

/** 못 찾은 것과 보관소가 없는 것은 안내 문장이 달라야 한다 */
async function intro(id: string): Promise<MapIntro | "down" | null> {
  try {
    return await getIntro(id);
  } catch (e) {
    if (e instanceof KvUnavailable) {
      console.error("[map] KV 환경변수가 없습니다 — Vercel 프로젝트에 KV 를 연결하세요.");
      return "down";
    }
    return null;
  }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const got = await intro((await params).id);
  const title =
    got && got !== "down" ? `나는 ${got.ownerName}님에게 어떤 사람일까?` : "포춘팟 귀인지도";
  const description = "생일만 넣으면 바로 나와요. 지도에는 이름과 유형만 보여요.";
  return { title, description, openGraph: { title, description } };
}

export default async function MapJoinPage({ params }: Params) {
  const { id } = await params;
  const got = await intro(id);

  if (!got || got === "down") {
    return (
      <section className="screen">
        <TopBar home menu />
        <div className="scroll">
          <div className="map-empty">
            {got === "down" ? (
              <p>
                지도 보관소에 연결하지 못했어요.<br />
                잠시 후 다시 시도해 주세요.
              </p>
            ) : (
              <p>
                지도를 찾을 수 없어요.<br />
                링크가 만료되었거나 주소가 잘못됐을 수 있어요.
              </p>
            )}
            <a className="btn primary focusable" href="/map">내 귀인지도 그리기</a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="screen">
      <TopBar home menu />
      <div className="scroll">
        <JoinPanel id={got.id} ownerName={got.ownerName} count={got.count} />
      </div>
    </section>
  );
}
