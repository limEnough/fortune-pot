"use client";
import { forwardRef, useMemo, type ReactNode } from "react";
import { applyDecor } from "@/lib/game/decor";
import type { ElementKey } from "@/lib/game/elements";
import type { Decor } from "@/lib/game/items";
import { placeCharacter, ROOM } from "@/lib/game/layout";
import ElementCharacter, { type CharacterHandle } from "./ElementCharacter";

/*
 * 방 배경 위에 캐릭터를 세우는 무대.
 *
 * 꾸미기 반영은 여기서 한다. 팔레트에서 아이템을 고르는 순간 서버를 다시 부르지
 * 않고 화면이 바뀌어야 하는데, `applyDecor` 가 순수 문자열 함수라 그게 된다.
 * 서버가 첫 렌더에 쓰는 것도, 이미지로 구울 때 쓰는 것도 같은 함수다 —
 * 화면·저장본·이미지가 어긋날 자리를 만들지 않는다.
 *
 * 캐릭터 위치는 방 좌표계에서 계산한 % 라서, 무대가 몇 px 이든 발이 바닥에 붙는다.
 */

interface Props {
  element: ElementKey;
  /** loadRoomSvg() 결과 (꾸미기 반영 전) */
  roomMarkup: string;
  characterMarkup: string;
  decor?: Decor;
  className?: string;
  /**
   * 방 아래에 잠깐 떴다 사라지는 안내.
   *
   * 문자열로 받는다 — 서버 컴포넌트가 JSX 를 prop 으로 넘기면 React 가 그것을
   * "서버에서 온 자식" 으로 보고 key 를 요구한다. 글자 한 줄이라 값으로 넘기는
   * 편이 그 규칙을 아예 만나지 않는다.
   */
  hint?: string;
  /** 포인트 배지 등 방 위에 얹을 것 (클라이언트 화면에서만) */
  overlay?: ReactNode;
  interactive?: boolean;
  onJump?: () => void;
}

const RoomStage = forwardRef<CharacterHandle, Props>(function RoomStage(
  { element, roomMarkup, characterMarkup, decor, className, hint, overlay, interactive, onJump },
  ref,
) {
  const markup = useMemo(() => applyDecor(roomMarkup, decor ?? {}), [roomMarkup, decor]);
  const place = placeCharacter(ROOM);

  return (
    <div className={`room-stage ${className ?? ""}`} data-room="front">
      <div className="room-bg" dangerouslySetInnerHTML={{ __html: markup }} />
      <ElementCharacter
        ref={ref}
        element={element}
        markup={characterMarkup}
        interactive={interactive}
        onJump={onJump}
        className="room-char"
        style={{ left: place.css.left, top: place.css.top, width: place.css.width }}
      />
      {hint && <span className="room-hint">{hint}</span>}
      {overlay}
    </div>
  );
});

export default RoomStage;
