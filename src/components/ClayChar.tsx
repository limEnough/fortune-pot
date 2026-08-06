"use client";
import { useEffect, useId, useState } from "react";
import { CLAY_VARIANTS, CLAY_LABELS, VARIANT_KEYS } from "@/lib/clay/variants";

interface Props {
  variant?: string;      // 지정하지 않으면 마운트 후 랜덤
  size?: "lg" | "sm";
  className?: string;
}

export default function ClayChar({ variant, size = "lg", className = "" }: Props) {
  // SSR/CSR 불일치 방지: 랜덤은 마운트 후에만
  const [key, setKey] = useState<string>(variant ?? "base");
  useEffect(() => {
    if (!variant) setKey(VARIANT_KEYS[Math.floor(Math.random() * VARIANT_KEYS.length)]);
  }, [variant]);

  const rawUid = useId();
  const uid = "u" + rawUid.replace(/[^a-zA-Z0-9]/g, "");

  const cls = ["char", size === "sm" ? "sm" : "", className]
    .filter(Boolean)
    .join(" ");

  let svg = CLAY_VARIANTS[key] ?? CLAY_VARIANTS.base;
  // 인스턴스마다 그라데이션 id 고유화 (화면 간 id 충돌로 글로우가 사라지는 문제 방지)
  svg = svg
    .replace(/id="([^"]+)"/g, (_m, id) => `id="${id}_${uid}"`)
    .replace(/url\(#([^)]+)\)/g, (_m, id) => `url(#${id}_${uid})`);

  // 루트 <svg>에 class·크기 규칙을 주입.
  // 원본 마크업이 class="char" 를 들고 있는지에 의존하면 SVG를 갈아끼울 때
  // 조용히 스타일이 통째로 빠지므로, 여기서 항상 붙인다.
  // width/height 속성은 CSS 폭 계산을 방해해서 제거하고 viewBox 비율에 맡긴다.
  svg = svg.replace(/<svg\b[^>]*>/, (tag) =>
    tag
      .replace(/\s(?:class|width|height|role|aria-label)="[^"]*"/g, "")
      .replace(/<svg/, `<svg class="${cls}" role="img" aria-label="${CLAY_LABELS[key] ?? CLAY_LABELS.base}"`)
  );

  return <div className="clay" dangerouslySetInnerHTML={{ __html: svg }} />;
}
