# 포춘팟 (FortunePot)

"사주로 보는 오늘의 운세" 모바일웹 — Next.js(App Router) + TypeScript + Tailwind + Zustand.

> **비회원(게스트) 전용 앱**입니다. 사주 정보는 브라우저(localStorage)에 저장됩니다.

## 빠른 시작

```bash
npm install
npm run dev        # http://localhost:3000
```

별도의 환경변수나 외부 서비스 설정 없이 바로 실행됩니다.

## 사용 흐름
시작하기 → 사주 정보 입력(이름·생년월일·시각·성별) → 오늘의 운세 →
상단 **📋 내 사주 정보** 칩을 누르면 입력값을 확인하는 바텀시트가 열리고,
거기서 전체 풀이(나의 사주는) 또는 사주 정보 수정으로 이동할 수 있어요.

## 구조
```
src/
  app/
    page.tsx              메인(시작 화면)
    onboarding/           사주 입력 폼
    fortune/              오늘의 운세 + 사주 정보 바텀시트 트리거
    saju/                 나의 사주는 (명식·오행·십성·세운/월운)
  components/
    ClayChar / StarField / AppShell        공통 UI·연출
    TopBar / NavDrawer                     상단바(확성기 버튼)·메뉴 드로어
    SajuForm / FortuneCard / SajuChart     입력·운세·명식
    SajuInfoSheet                          사주 정보 확인 바텀시트
    ReleaseNoteSheet                       업데이트 소식 바텀시트
  lib/saju/               calc(명식·십성), fortune(운세), text(해설), constants
  lib/clay/               캐릭터 5종 SVG
  lib/releases.ts         앱 내 릴리즈 노트 데이터
  store/                  Zustand (게스트 사주 persist / UI 드로어 / 릴리즈 확인 상태)
  hooks/useSaju.ts        사주 정보 읽기·저장 통합 훅
  hooks/useRelease.ts     안 본 업데이트 판별 + 시트 열기/닫기
```

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
