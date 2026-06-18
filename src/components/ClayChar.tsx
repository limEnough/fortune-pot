"use client";
import { useEffect, useId, useState } from "react";
import { CLAY_VARIANTS, VARIANT_KEYS } from "@/lib/clay/variants";

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

  let svg = CLAY_VARIANTS[key] ?? CLAY_VARIANTS.base;
  // 인스턴스마다 그라데이션 id 고유화 (화면 간 id 충돌로 글로우가 사라지는 문제 방지)
  svg = svg
    .replace(/id="([^"]+)"/g, (_m, id) => `id="${id}_${uid}"`)
    .replace(/url\(#([^)]+)\)/g, (_m, id) => `url(#${id}_${uid})`)
    .replace('class="char"', `class="char ${size === "sm" ? "sm" : ""} ${className}"`);

  return <div dangerouslySetInnerHTML={{ __html: svg }} />;
}
