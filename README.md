# 포춘팟 (FortunePot)

"사주로 보는 오늘의 운세" 모바일웹 — Next.js(App Router) + TypeScript + Tailwind + Zustand.

> **비회원(게스트) 전용 앱**입니다. 사주 정보는 브라우저(localStorage)에 저장됩니다.

## 빠른 시작

```bash
npm install
npm run dev        # http://localhost:3000
```

별도의 환경변수나 외부 서비스 설정 없이 바로 실행됩니다.

## 폰트

Jua(제목)와 Noto Sans KR(본문)을 **repo 안에 직접 들고 있습니다.**

- `public/fonts/` — woff2 211개, 3.9 MB
- `src/app/fonts.css` — `@font-face` 337개 (자동 생성, 직접 고치지 마세요)

빌드할 때 바깥으로 나가지 않으므로, 어느 망에서 clone 하든 똑같이 빌드됩니다.
예전엔 `next/font` 로 빌드 타임에 Google Fonts 를 받아왔는데, TLS 를 가로채는
사내망에서 Node 가 인증서 체인을 거부해 폰트 없이 빌드되는 일이 있었습니다.
`next build` 는 에러로 멈추지만 `next dev` 는 **경고만 내고 Arial 폴백으로
조용히 넘어가서**, 화면은 뜨는데 글꼴만 어긋난 채로 한참 갑니다.

3.9 MB 를 다 받는 사람은 없습니다. `unicode-range` 로 쪼개져 있어서 브라우저가
화면에 실제로 뜬 글자가 속한 슬라이스만 가져갑니다. 사용자 이름이 두 폰트 모두에
렌더되기 때문에(`.f-name` 등) 한글 커버리지를 미리 줄일 수는 없어서, 통짜 파일
하나로 합치면 안 됩니다.

Noto 는 가변 폰트라 400 과 700 이 같은 woff2 를 가리킵니다. 중복이 아니라
`wght` 축으로 인스턴스를 고르는 것입니다.

### 폰트 갱신

새 버전을 받아야 할 때만 하면 됩니다. 이 단계에서만 네트워크(사내망이면
`NODE_EXTRA_CA_CERTS` 로 사내 루트 CA 지정)가 필요합니다.

1. [`src/app/layout.tsx`](src/app/layout.tsx) 를 잠시 `next/font/google` 방식으로 되돌립니다
   (`git log -- src/app/layout.tsx` 에 이전 형태가 있습니다)
2. `rm -rf .next && npm run build` — `next dev` 가 떠 있으면 `.next\trace` 를
   잡고 있어 `EPERM` 으로 죽으니 먼저 내리세요
3. `node scripts/vendor-fonts.js` — `public/fonts/` 와 `src/app/fonts.css` 재생성
4. `layout.tsx` 를 되돌린 것 원복 (`fonts.css` import 만 남기기)
5. `rm -rf .next && npm run build` 로 확인 — 이번엔 **CA 설정 없이** 통과해야 정상입니다

## 사용 흐름

시작 화면에서 **먼저 볼 화면을 고르는 것**으로 출발합니다. 운세만 궁금한 사람과
사주 풀이가 궁금한 사람의 목적지가 다르기 때문에, 입구를 두 개로 두었습니다.

```
             ┌ 🔮 오늘의 운세 → /onboarding?next=fortune ┐
시작 화면 ───┤                                            ├─→ 사주 입력 폼 ─→ 고른 화면
             └ 📜 나의 사주   → /onboarding?next=saju    ┘      (공통)
```

- 어느 쪽을 눌러도 **입력 폼은 같습니다**(이름·생년월일·시각·성별). 분석 후 도착지만 달라져요.
- 도착지는 쿼리 파라미터 `?next=fortune|saju` 하나로만 전달되고 `SajuForm`이 읽어서 이동합니다.
  파라미터가 없으면 기본값은 `/fortune` — 기존 링크·북마크는 그대로 동작합니다.
  `useSearchParams()` 프리렌더 요건 때문에 폼은 `<Suspense>`로 감싸져 있습니다.
- 최근 조회 기록이 있으면 폼 상단 말풍선이 재사용을 제안하고, 이때도 고른 도착지로 갑니다.

도착한 뒤에는 두 화면이 상단 칩으로 서로를 오갑니다.

| 화면 | 칩 | 동작 |
|---|---|---|
| `/fortune` | 📋 내 사주 정보 | 입력값 확인 바텀시트 → 전체 풀이 또는 정보 수정으로 이동 |
| `/saju` | 🔮 오늘의 운세 확인하기 | `/fortune` 으로 바로 이동 |

LNB의 *사주정보 수정하기* 는 `/saju` 에서 들어왔다면 수정 후 다시 `/saju` 로 돌려보냅니다.

## 구조
```
src/
  app/
    page.tsx              메인(시작 화면 · 운세/사주 진입 분기)
    onboarding/           사주 입력 폼 (?next= 로 도착지 결정)
    fortune/              오늘의 운세 + 사주 정보 바텀시트 트리거
    saju/                 나의 사주는 (명식·오행·십성·세운/월운) + 운세 이동 칩
  components/
    ClayChar / StarField / AppShell        공통 UI·연출
    TopBar / NavDrawer                     상단바(확성기 버튼)·메뉴 드로어
    SajuForm / FortuneCard / SajuChart     입력·운세·명식
    SajuInfoSheet                          사주 정보 확인 바텀시트
    SaveCardButton                         카드 이미지 미리보기·저장 바텀시트
    ReleaseNoteSheet                       업데이트 소식 바텀시트
  lib/saju/               calc(명식·십성), fortune(운세), text(해설), constants
                          summary(명식·오행·십성 집계 — 화면과 카드가 공유)
  lib/share/              draw(캔버스 유틸), sajuCard·fortuneCard(카드 도안)
  lib/clay/               캐릭터 5종 SVG
  lib/releases.ts         앱 내 릴리즈 노트 데이터
  store/                  Zustand (게스트 사주 persist / UI 드로어 / 릴리즈 확인 상태)
  hooks/useSaju.ts        사주 정보 읽기·저장 통합 훅
  hooks/useRelease.ts     안 본 업데이트 판별 + 시트 열기/닫기
```

## 카드 이미지 저장

두 화면 맨 아래 버튼이 각각 카드를 그려 미리보기 바텀시트로 띄웁니다.

| 화면 | 카드 | 담기는 것 |
|---|---|---|
| `/saju` | 사주 정보 카드 | 명식·오행·십성·일간 풀이 — **바뀌지 않는 것** |
| `/fortune` | 오늘의 부적 | 그날의 등급·분야별 운세·행운·한마디 — **오늘치** |

**DOM 스냅샷(html2canvas 류)을 쓰지 않고 Canvas 2D 로 직접 그립니다.** 화면이
gradient·backdrop-filter·box-shadow 로 짜여 있어 스냅샷 계열이 그대로 옮기지
못하고, 접힘 패널·스크롤 위치 같은 화면 상태에 결과가 끌려다닙니다. 게다가
카드는 화면과 레이아웃이 아예 다릅니다(세로로 길고 여백이 넉넉한 인쇄물).

- 좌표계는 **가로 1080px 고정**, 세로는 내용에 따라. 높이를 미리 알 수 없으므로
  투명 레이어에 내용을 먼저 그려 실제 높이를 재고, 그 높이로 만든 캔버스에
  배경 → 레이어 순으로 합성합니다(`draw.ts` 의 `layered`).
- 그리기 전에 **`document.fonts.load(font, text)` 로 글리프를 받아둡니다.**
  `fonts.css` 가 `unicode-range` 로 쪼개져 있어서, 화면에 아직 안 뜬 글자는
  슬라이스가 없습니다. 그대로 그리면 폴백으로 그려질 뿐 아니라 `measureText` 도
  폴백 기준이라 **줄바꿈까지 어긋납니다.**
- 줄바꿈은 CSS `word-break: keep-all` 과 같은 규칙입니다. 브라우저 기본값은
  한글을 음절 단위로 끊는데(UAX #14), 줄이 긴 카드에선 끝의 한두 글자만
  넘어가는 모양이 자주 나옵니다.
- 저장 경로가 셋입니다 — 공유 시트(`navigator.share`), `a[download]`,
  미리보기 이미지 길게 누르기. iOS 에서 앞의 둘이 막혀도 마지막은 늘 통하므로
  미리보기를 반드시 보여줍니다.
- 캐릭터 SVG 는 `data:` URL 로 넣어 캔버스가 오염되지 않게 합니다(`toBlob` 가능).
  브라우저가 SVG 를 고유 크기로 래스터화한 뒤 확대하는 경우가 있어, 그릴 크기를
  `width`/`height` 속성에 미리 박아 넣습니다.

## 데이터 전략
- **계산 로직**(명식·십성·세운) → 코드(`lib/saju`). 저장하지 않음.
- **사용자 입력**(생년월일시) → Zustand persist(localStorage)에 보관.
- **오늘의 운세** → 이름+날짜 seed로 매번 계산(저장 안 함).
- 해설 문구는 `lib/saju/text.ts`. 자주 바꾸거나 다국어가 필요해지면 DB/CMS로 이전.

## 릴리즈 노트

이력은 두 군데에 있고, **버전 문자열을 반드시 맞춰야** 합니다.

| 위치 | 대상 | 문체 |
|---|---|---|
| [`CHANGELOG.md`](CHANGELOG.md) | 개발자 | Keep a Changelog (`Added`/`Changed`/`Fixed`/`Removed`) |
| [`src/lib/releases.ts`](src/lib/releases.ts) | 앱 사용자 | "~했어요" 안내 문장 |

앱에서는 헤더 **확성기 버튼**으로 보여줍니다. `seenVersion`(localStorage `fortunepot-release`)이
`RELEASES[0].version`과 다르면 6초짜리 말풍선 + 점이 뜨고, 시트를 열면 확인 처리됩니다.
말풍선 노출 시간은 `TopBar.tsx`의 `BUBBLE_MS` 상수입니다.
첫 방문자에겐 알리지 않고 방문 시점 버전을 기준점으로 심어, **다음** 릴리즈부터 뜹니다.

`package.json`의 `version`은 **마지막으로 태그된** 릴리즈를 가리킵니다.
개발 중에는 `RELEASES[0].version`(다음 릴리즈)보다 한 단계 뒤에 있는 게 정상입니다.

### 새 버전 배포 절차

```bash
# 1. CHANGELOG.md 의 [Unreleased] → [x.y.z] 로 확정, 비교 링크 갱신
# 2. src/lib/releases.ts 배열 맨 앞에 사용자 문장으로 추가
# 3. package.json version 동기화
npm version 0.5.0 -m "chore: [release] v%s"   # 커밋 + v0.5.0 태그
git push --follow-tags

# 4. GitHub Release 발행
gh release create v0.5.0 --title "v0.5.0 — 한 줄 요약" --notes "$(...)"
```

GitHub 저장소 우측 **Releases** 에 태그별 카드로 쌓이고, 소스 아카이브가 자동 첨부됩니다.
웹 UI의 *Draft a new release → Generate release notes* 를 쓰면 머지된 PR 제목으로 초안이 생성됩니다.

## ⚠️ 사주 계산 주의
명식·세운 계산은 [`lunar-javascript`](https://github.com/6tail/lunar-javascript) 만세력을 사용하며(입춘·각월 절입 시각, 23시 자시 경계 반영), 한국 표준시 입력을 **서울 경도 기준 진태양시(균시차 포함)**로 환산해 명식을 산출합니다.
출생지 경도가 서울과 크게 다르거나 시지 경계 부근이면 별도 보정이 필요할 수 있습니다.

## 배포 (Vercel)
Vercel 프로젝트로 import 후 그대로 배포 — 환경변수 설정 없음.
