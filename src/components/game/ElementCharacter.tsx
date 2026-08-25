"use client";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { ELEMENTS, type ElementKey } from "@/lib/game/elements";

/*
 * 인라인 SVG 캐릭터 + 누르면 튀어오르는 인터랙션.
 *
 * 에셋 안에도 같은 일을 하는 `<script>` 가 들어 있지만, `dangerouslySetInnerHTML`
 * 로 넣은 스크립트는 브라우저가 실행하지 않는다. 그래서 서버(loadSvg.ts)가 그
 * 스크립트를 걷어내고, 점프는 여기서 `.fp-pop` 클래스를 토글해 구동한다.
 * 애니메이션 정의(@keyframes)는 SVG 내부 `<style>` 에 그대로 살아 있다.
 */

export interface CharacterHandle {
  /** 바깥에서 튀게 하기 — 출석 보상 연출 등 */
  jump: () => void;
}

interface Props {
  element: ElementKey;
  /** 서버에서 loadCharacterSvg() 로 만든 마크업 */
  markup: string;
  className?: string;
  style?: CSSProperties;
  /** false 면 장식용(aria-hidden) — 바깥에서만 튀게 할 수 있다 */
  interactive?: boolean;
  onJump?: () => void;
  label?: string;
}

const ElementCharacter = forwardRef<CharacterHandle, Props>(function ElementCharacter(
  { element, markup, className, style, interactive = true, onJump, label },
  ref,
) {
  const rootRef = useRef<HTMLDivElement>(null);

  const jump = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;
    const char = root.querySelector<SVGGElement>(".fp-char");
    if (!char) return;
    const shadow = root.querySelector<SVGEllipseElement>(".fp-shadow");

    // 연타 대응: 클래스를 뗀 뒤 강제 리플로우로 애니메이션을 처음부터 재생한다
    char.classList.remove("fp-pop");
    shadow?.classList.remove("fp-pop");
    void char.getBoundingClientRect();
    char.classList.add("fp-pop");
    shadow?.classList.add("fp-pop");

    onJump?.();
  }, [onJump]);

  useImperativeHandle(ref, () => ({ jump }), [jump]);

  // 다 튀고 나면 클래스를 정리한다 — 다음 클릭이 처음부터 재생되도록
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const handle = (event: Event) => {
      const { animationName, target } = event as AnimationEvent;
      if (!(target instanceof Element)) return;
      if (animationName.startsWith("fp-pop-") || animationName.startsWith("fp-shadow-")) {
        target.classList.remove("fp-pop");
      }
    };
    root.addEventListener("animationend", handle);
    return () => root.removeEventListener("animationend", handle);
  }, []);

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        jump();
      }
    },
    [jump],
  );

  const meta = ELEMENTS[element];

  if (!interactive) {
    return (
      <div
        ref={rootRef}
        className={className}
        style={style}
        data-element={element}
        aria-hidden
        dangerouslySetInnerHTML={{ __html: markup }}
      />
    );
  }

  return (
    <div
      ref={rootRef}
      className={className}
      style={{ cursor: "pointer", ...style }}
      data-element={element}
      role="button"
      tabIndex={0}
      aria-label={label ?? `${meta.ohaeng} 캐릭터 ${meta.name} 쓰다듬기`}
      onPointerDown={jump}
      onKeyDown={onKeyDown}
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
});

export default ElementCharacter;
