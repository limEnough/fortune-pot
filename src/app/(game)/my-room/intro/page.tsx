import type { Metadata } from "next";
import CharacterIntro from "@/components/game/CharacterIntro";
import { loadAllCharacterSvgs } from "@/lib/game/loadSvg";

export const metadata: Metadata = {
  title: "내 캐릭터 — 포춘팟",
  description: "사주 일간으로 정해지는 오행 캐릭터를 만나보세요",
};

/**
 * 캐릭터를 빚는 화면.
 *
 * 다섯 벌을 모두 내려보낸다. 어느 하나가 나오는지는 브라우저만 알고(사주가
 * 거기 있다), 연출 자체가 다섯을 갈아 끼우며 도는 것이라 어차피 다 필요하다.
 */
export default async function IntroPage() {
  const characterMarkups = await loadAllCharacterSvgs();
  return <CharacterIntro characterMarkups={characterMarkups} />;
}
