"use client";
import { useCallback } from "react";
import SaveCardButton from "@/components/SaveCardButton";
import { renderRoomCard } from "@/lib/game/capture";
import { applyDecor } from "@/lib/game/decor";
import type { ElementKey } from "@/lib/game/elements";
import type { Decor } from "@/lib/game/items";

/**
 * 방을 이미지로 저장·공유한다.
 *
 * 저장 UI 는 운세·사주 카드와 같은 것(`SaveCardButton`)을 쓴다. 미리보기를 반드시
 * 띄우는 것도 같은 이유다 — iOS 에서 공유 시트가 막혀 있어도 이미지를 길게 눌러
 * 가져가는 길이 늘 남아 있어야 한다.
 *
 * 그리는 방식만 다르다. 카드들은 Canvas 2D 로 좌표를 직접 잡지만, 방은 화면에
 * 보이는 그대로가 결과여야 해서 SVG 를 합성해 굽는다(`lib/game/capture.ts`).
 */
interface Props {
  element: ElementKey;
  roomMarkup: string;
  characterMarkup: string;
  decor: Decor;
  nickname: string | null;
  /** 카드 아래에 찍을 공유 주소 */
  shareUrl?: string;
}

export default function SaveRoomButton({
  element,
  roomMarkup,
  characterMarkup,
  decor,
  nickname,
  shareUrl,
}: Props) {
  const render = useCallback(
    () =>
      renderRoomCard({
        element,
        nickname,
        shareUrl,
        // 화면에 쓴 것과 같은 함수로 꾸미기를 반영한다 — 결과가 어긋날 자리가 없다
        roomMarkup: applyDecor(roomMarkup, decor),
        characterMarkup,
      }),
    [element, nickname, shareUrl, roomMarkup, characterMarkup, decor],
  );

  return (
    <SaveCardButton
      label="방 사진 저장"
      title="내 방"
      hint="이미지를 눌러 저장하거나, 아래 버튼으로 공유해 보세요."
      filename="fortunepot-room.png"
      render={render}
    />
  );
}
