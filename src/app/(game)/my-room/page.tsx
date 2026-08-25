import type { Metadata } from "next";
import MyRoom from "@/components/game/MyRoom";
import { loadAllCharacterSvgs, loadRoomSvg } from "@/lib/game/loadSvg";

export const metadata: Metadata = {
  title: "내 방 — 포춘팟",
  description: "사주 일간으로 정해진 오행 캐릭터가 사는 나만의 방",
};

/**
 * 내 방.
 *
 * 방 배경과 캐릭터 SVG 는 여기(서버)에서 읽어 SSR 결과에 실어 보낸다. 브라우저가
 * 다시 받으러 가지 않으니 캐릭터가 뒤늦게 나타나는 깜빡임이 없다.
 * 어느 캐릭터인지는 하이드레이션 뒤에 정해진다 — 그 판단에 필요한 사주가
 * 브라우저에만 있기 때문이다. 자세한 사정은 `lib/game/loadSvg.ts` 주석에.
 */
export default async function MyRoomPage() {
  const [roomMarkup, characterMarkups] = await Promise.all([
    loadRoomSvg("front"),
    loadAllCharacterSvgs(),
  ]);

  return <MyRoom roomMarkup={roomMarkup} characterMarkups={characterMarkups} />;
}
