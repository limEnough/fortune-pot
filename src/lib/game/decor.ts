import { DEFAULT_ITEM, SLOT_GROUP, SLOT_KEYS, itemById, type Decor } from "./items";

/*
 * 꾸미기 상태를 방 SVG 문자열에 반영한다.
 *
 * 서버(첫 렌더)와 브라우저(팔레트에서 고르는 순간), 그리고 프로필 이미지를 굽는
 * 코드가 **같은 함수**를 쓴다. 화면과 저장본과 이미지가 어긋날 수 없어야 하기
 * 때문이다. 순수 문자열 함수라 어느 쪽에서 불러도 된다.
 *
 * 방 SVG 는 우리가 만든 에셋이므로 파서를 들이지 않고 태그를 센다. 다만 슬롯
 * 그룹 안에 `<g>` 가 중첩돼 있어(`slot-window` 의 clip 그룹 등) 첫 `</g>` 를
 * 닫는 짝으로 볼 수 없다 — 깊이를 세면서 짝을 찾는다.
 */

/** `<g id="{id}" …>` 의 속을 통째로 바꾼다. 못 찾으면 원본을 그대로 돌려준다. */
export function replaceGroupInner(svg: string, id: string, inner: string): string {
  const open = new RegExp(`<g(?=[\\s>])[^>]*\\sid="${id}"[^>]*>`).exec(svg);
  if (!open) return svg;

  const start = open.index + open[0].length;
  const tag = /<g(?=[\s>])|<\/g>/g;
  tag.lastIndex = start;

  let depth = 1;
  let end = -1;
  for (let m = tag.exec(svg); m; m = tag.exec(svg)) {
    if (m[0] === "</g>") {
      depth -= 1;
      if (depth === 0) {
        end = m.index;
        break;
      }
    } else {
      depth += 1;
    }
  }
  if (end < 0) return svg; // 짝이 안 맞는 에셋 — 건드리지 않는 편이 안전하다

  return svg.slice(0, start) + inner + svg.slice(end);
}

/**
 * 고른 아이템을 방 마크업에 끼워 넣는다.
 * 기본값(`svg === null`)인 슬롯은 손대지 않으므로, 아무것도 안 고른 방은
 * 에셋 원본 그대로다.
 */
export function applyDecor(roomMarkup: string, decor: Decor): string {
  let out = roomMarkup;
  for (const slot of SLOT_KEYS) {
    const id = decor[slot];
    if (!id || id === DEFAULT_ITEM[slot]) continue;
    const item = itemById(id);
    if (!item || item.slot !== slot || item.svg === null) continue;
    out = replaceGroupInner(out, SLOT_GROUP[slot], item.svg);
  }
  return out;
}
