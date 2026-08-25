import type { Metadata } from "next";
import Decorator from "@/components/game/Decorator";
import { loadAllCharacterSvgs, loadRoomSvg } from "@/lib/game/loadSvg";

export const metadata: Metadata = {
  title: "방 꾸미기 — 포춘팟",
};

/** 꾸미기 모드. 에셋을 읽는 방식은 `/my-room` 과 같다(요청 안에서 한 번만 읽힌다). */
export default async function DecoratePage() {
  const [roomMarkup, characterMarkups] = await Promise.all([
    loadRoomSvg("front"),
    loadAllCharacterSvgs(),
  ]);

  return <Decorator roomMarkup={roomMarkup} characterMarkups={characterMarkups} />;
}
