// 결정론적 별 배치 (SSR/CSR 동일) — 하이드레이션 불일치 방지
function lcg(seed: number) {
  let s = seed;
  return () => ((s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
}

const rnd = lcg(20260616);
const STARS = Array.from({ length: 46 }, () => {
  const sz = rnd() * 2 + 1;
  return {
    left: `${(rnd() * 100).toFixed(2)}%`,
    top: `${(rnd() * 100).toFixed(2)}%`,
    w: `${sz.toFixed(1)}px`,
    delay: `${(rnd() * 3).toFixed(2)}s`,
  };
});

export default function StarField() {
  return (
    <div className="stars" aria-hidden>
      {STARS.map((s, i) => (
        <i key={i} style={{ left: s.left, top: s.top, width: s.w, height: s.w, animationDelay: s.delay }} />
      ))}
    </div>
  );
}
