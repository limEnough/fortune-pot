import { readFile } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";

import type { ElementKey } from "./elements";
import { ELEMENT_KEYS } from "./elements";
import type { RoomKey } from "./layout";

/*
 * SVG 를 인라인용 마크업으로 읽어 온다. (서버 전용)
 *
 * 왜 `<img src>` 가 아닌가 — `<img>` 안의 SVG 는 바깥 CSS 도 스크립트도 닿지
 * 않는 격리 문서라 클릭 점프가 동작하지 않는다. 인터랙션이 필요하면 인라인이
 * 유일한 선택이다.
 *
 * 왜 fetch 가 아니라 fs 인가 — 서버 컴포넌트에서 바로 읽으면 SSR 결과에 마크업이
 * 실려 깜빡임이 없고, 브라우저의 추가 왕복도 없다. `public/` 에 원본은 그대로
 * 두므로 썸네일 용도로 `<img>` 를 쓰는 길도 남는다.
 *
 * `server-only` 패키지는 넣지 않는다(의존성을 늘리지 않는 기조). 대신 이 모듈은
 * 서버 컴포넌트와 라우트 핸들러에서만 부른다 — 클라이언트 컴포넌트가 import 하면
 * `node:fs` 때문에 번들 단계에서 바로 깨지므로 실수가 조용히 넘어가지 않는다.
 */

const ASSET_ROOT = path.join(process.cwd(), "public", "game");

export interface InlineSvgOptions {
  /** 같은 캐릭터를 한 화면에 두 번 넣을 때 id 충돌을 막는 접미사 */
  idSuffix?: string;
}

/**
 * `<script>` 제거 — 필수.
 * `dangerouslySetInnerHTML` 로 넣은 스크립트는 브라우저가 실행하지 않는다.
 * 에셋 안의 스크립트는 클릭 점프용인데, 그 일은 ElementCharacter 가 React 쪽에서
 * `.fp-pop` 클래스를 토글해 대신한다. 애니메이션 정의(@keyframes)는 SVG 내부
 * `<style>` 에 그대로 남아 있으므로 움직임은 살아 있다.
 */
const stripScript = (svg: string) => svg.replace(/<script[\s\S]*?<\/script>/g, "");

/** XML 선언 — HTML 에 인라인할 때는 필요 없다 */
const stripXmlDeclaration = (svg: string) => svg.replace(/<\?xml[^>]*\?>\s*/g, "");

/** CDATA 마커 — XML 파서용이라 HTML 인라인에서는 없어도 된다 */
const stripCdata = (svg: string) => svg.replace(/<!\[CDATA\[/g, "").replace(/\]\]>/g, "");

/** 고정 width/height 제거 → 크기는 CSS 로만 준다(viewBox 는 유지) */
const makeFluid = (svg: string) =>
  svg.replace(/<svg([^>]*?)\swidth="\d+"\sheight="\d+"/, "<svg$1");

/**
 * 캐릭터 안의 히트 영역에서 포커스·역할 속성을 걷어낸다.
 *
 * 에셋은 단독으로 열어도 눌리도록 `<rect class="fp-hit" tabindex role aria-label>`
 * 을 갖고 있다. 그런데 React 래퍼(ElementCharacter)가 같은 역할을 다시 얹으므로,
 * 그대로 두면 버튼 안에 버튼이 들어가고 탭 순서에도 두 번 걸린다.
 * 사각형 자체는 남긴다 — 투명한 부분까지 눌리게 해 주는 건 이 rect 다.
 */
const stripHitAffordance = (svg: string) =>
  svg.replace(/<rect class="fp-hit"[^>]*>/g, (tag) =>
    tag.replace(/\s(?:tabindex|role|aria-label)="[^"]*"/g, ""),
  );

/**
 * id 와 그 참조(`url(#id)`, `href="#id"`)에 접미사를 붙인다.
 * 캐릭터 에셋의 id 는 모두 `-{key}` 로 끝나도록 만들어져 있어 안전하게 치환된다.
 */
function namespaceIds(svg: string, key: string, suffix: string): string {
  if (!suffix) return svg;
  const tail = `-${key}`;
  return svg
    .replace(new RegExp(`(id=")([^"]*?)${tail}"`, "g"), `$1$2${tail}${suffix}"`)
    .replace(new RegExp(`url\\(#([^)]*?)${tail}\\)`, "g"), `url(#$1${tail}${suffix})`)
    .replace(new RegExp(`(href=")#([^"]*?)${tail}"`, "g"), `$1#$2${tail}${suffix}"`);
}

const read = (relative: string) => readFile(path.join(ASSET_ROOT, relative), "utf8");

export const loadCharacterSvg = cache(
  async (key: ElementKey, options: InlineSvgOptions = {}): Promise<string> => {
    const raw = await read(`characters/${key}.svg`);
    let svg = stripXmlDeclaration(raw);
    svg = stripScript(svg);
    svg = stripCdata(svg);
    svg = makeFluid(svg);
    svg = stripHitAffordance(svg);
    svg = namespaceIds(svg, key, options.idSuffix ?? "");
    return svg.trim();
  },
);

export const loadRoomSvg = cache(async (room: RoomKey = "front"): Promise<string> => {
  const raw = await read(room === "front" ? "rooms/room-front.svg" : "rooms/room-iso.svg");
  let svg = stripXmlDeclaration(raw);
  svg = stripScript(svg);
  svg = stripCdata(svg);
  return makeFluid(svg).trim();
});

/**
 * 캐릭터 5종을 한 번에.
 *
 * 내 방 화면은 캐릭터가 무엇인지 **서버가 알 수 없다** — 사주는 브라우저에만
 * 있고(그게 이 서비스의 기조다) 방 문서도 localStorage 의 id 로 찾는다. 그래서
 * 다섯 벌을 다 내려보내고 하이드레이션 뒤에 하나를 고른다.
 * 5종 합쳐 약 58KB(gzip 후 12KB 남짓)이고, 대신 캐릭터가 뒤늦게 나타나는 깜빡임과
 * 왕복이 없다. 원소를 서버가 아는 화면(`/room/[publicId]`)에서는 한 벌만 읽는다.
 */
export const loadAllCharacterSvgs = cache(
  async (options: InlineSvgOptions = {}): Promise<Record<ElementKey, string>> => {
    const entries = await Promise.all(
      ELEMENT_KEYS.map(async (k) => [k, await loadCharacterSvg(k, options)] as const),
    );
    return Object.fromEntries(entries) as Record<ElementKey, string>;
  },
);
