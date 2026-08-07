/*
 * next/font 가 받아온 폰트를 repo 안으로 옮긴다.
 *
 * 평소엔 쓸 일이 없다. Jua/Noto Sans KR 을 새 버전으로 갱신할 때만 쓴다.
 * 절차는 README "폰트 갱신" 참고 — 요약하면 layout.tsx 에서 잠깐 next/font 로
 * 되돌려 빌드한 뒤 이 스크립트를 돌리면 public/fonts/ 와 src/app/fonts.css 가
 * 다시 만들어진다. Google 로 나가야 하므로 그때만 네트워크(사내망이면 CA)가 필요하다.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const CSS_DIR = path.join(ROOT, ".next/static/css");
const MEDIA_DIR = path.join(ROOT, ".next/static/media");
const OUT_FONTS = path.join(ROOT, "public/fonts");
const OUT_CSS = path.join(ROOT, "src/app/fonts.css");

const slug = (f) =>
  f.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

if (!fs.existsSync(CSS_DIR)) {
  console.error("`.next` 가 없다. next/font 로 되돌린 뒤 npm run build 부터.");
  process.exit(1);
}

const css = fs
  .readdirSync(CSS_DIR)
  .filter((f) => f.endsWith(".css"))
  .map((f) => fs.readFileSync(path.join(CSS_DIR, f), "utf8"))
  .join("\n");

const faces = css.match(/@font-face\s*\{[^}]*\}/g) || [];
if (!faces.length) {
  console.error("@font-face 가 하나도 없다. 빌드가 폰트를 못 받아온 상태다.");
  process.exit(1);
}

fs.rmSync(OUT_FONTS, { recursive: true, force: true });
fs.mkdirSync(OUT_FONTS, { recursive: true });

// 원본 woff2 -> vendoring 된 이름. Noto 는 가변 폰트라 400/700 이 같은 파일을
// 쓰므로 이름에 weight 를 넣지 않는다. 넣으면 같은 파일이 두 벌 생긴다.
const renamed = new Map();
const counters = new Map();
const real = [];
const fallback = [];

for (const face of faces) {
  const family = (face.match(/font-family:\s*["']?([^;"']+)["']?/) || [])[1];
  const urlMatch = face.match(/url\(([^)]*\/media\/([^)/]+\.woff2))\)/);

  if (!urlMatch) {
    fallback.push(face); // src: local("Arial") + metric override
    continue;
  }

  const src = urlMatch[2];
  if (!renamed.has(src)) {
    const key = slug(family);
    const n = (counters.get(key) || 0) + 1;
    counters.set(key, n);
    const name = `${key}-${String(n).padStart(3, "0")}.woff2`;
    fs.copyFileSync(path.join(MEDIA_DIR, src), path.join(OUT_FONTS, name));
    renamed.set(src, name);
  }

  real.push(face.replace(urlMatch[1], `/fonts/${renamed.get(src)}`));
}

const norm = (s) =>
  s
    .replace(
      /font-family:\s*["']?([^;"'}]+?)["']?\s*(?=[;}])/,
      'font-family: "$1"'
    )
    .replace(/([a-z-]+):(?=\S)/g, "$1: ")
    .replace(/\s*\{\s*/, " {\n  ")
    .replace(/;\s*/g, ";\n  ")
    .replace(/\s*\}\s*$/, ";\n}")
    .replace(/;+\n\}/, ";\n}")
    .replace(/\n\s+\n/g, "\n");

const files = fs.readdirSync(OUT_FONTS);
const mb = (
  files.reduce((s, f) => s + fs.statSync(path.join(OUT_FONTS, f)).size, 0) /
  1024 /
  1024
).toFixed(1);

const header = `/*
 * 자동 생성 파일 — 직접 고치지 말 것. scripts/vendor-fonts.js 가 만든다.
 *
 * Jua / Noto Sans KR 을 repo 에 직접 들고 있다. next/font 는 빌드 타임에
 * Google 로 나가는데 TLS 를 가로채는 사내망에선 그게 막힌다. 게다가 dev 모드는
 * 실패해도 에러 없이 Arial 폴백으로 조용히 넘어가서 알아채기 어렵다. 파일을
 * 들고 있으면 어느 망에서 clone 하든 똑같이 빌드된다.
 *
 * unicode-range 슬라이싱이 핵심이다. 전체는 ${mb} MB 지만 브라우저는 화면에
 * 실제로 뜬 글자가 속한 슬라이스만 받는다. 이름이 사용자 입력이라(.f-name 등
 * 이름을 그리는 자리가 두 폰트 모두에 있다) 한글 커버리지를 미리 줄일 수 없어
 * 통짜로 들고 있으면 안 된다.
 *
 * Noto 는 가변 폰트라 400/700 이 같은 woff2 를 가리킨다. 중복이 아니라 wght
 * 축으로 인스턴스를 고르는 것이라, 파일명에 weight 를 넣지 않았다.
 *
 * 맨 앞 두 @font-face 의 size-adjust/ascent-override 는 폰트가 로드되기 전
 * Arial 로 그려지는 동안의 레이아웃 흔들림을 줄인다. next/font 가 계산해준 값.
 */

`;

fs.writeFileSync(
  OUT_CSS,
  header + [...fallback, ...real].map(norm).join("\n\n") + "\n"
);

console.log(`woff2      : ${files.length}개, ${mb} MB`);
console.log(`@font-face : 실제 ${real.length} + 폴백 ${fallback.length}`);
console.log(`fonts.css  : ${(fs.statSync(OUT_CSS).size / 1024).toFixed(1)} KB`);
for (const [k, v] of counters) console.log(`  ${k}: ${v} files`);
console.log("\nlayout.tsx 를 next/font 없는 상태로 되돌리는 것 잊지 말 것.");
