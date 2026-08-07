# 변경 이력

이 파일의 형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.1.0/)를 따르며,
버전 규칙은 [유의적 버전(SemVer)](https://semver.org/lang/ko/)을 따릅니다.

> 앱 안에서 보여주는 릴리즈 노트는 `src/lib/releases.ts`에 있습니다.
> 여기에 새 버전을 추가하면 그쪽도 함께 갱신해 주세요. (사용자 눈높이 문장으로)

## [Unreleased]

> 다음 릴리즈에 나갈 변경을 여기에 쌓습니다.
> 릴리즈할 때 이 섹션을 `## [x.y.z] - YYYY-MM-DD` 로 바꾸고 맨 아래 비교 링크를 추가하세요.

### Changed

- **폰트 파일을 repo 안으로 옮겼습니다**(`public/fonts/`, `src/app/fonts.css`).
  `next/font` 가 빌드 타임에 Google Fonts 로 나가는 탓에, TLS 를 가로채는 사내망에서
  폰트 없이 빌드되는 일이 있었습니다. 이제 빌드가 바깥으로 나가지 않습니다.
  화면에 보이는 결과는 그대로입니다 — `unicode-range` 슬라이싱도 유지됩니다.

## [0.6.0] - 2026-08-07

### Added

- 시작 화면에서 '오늘의 운세'와 '나의 사주' 중 먼저 볼 화면을 고를 수 있습니다.
  두 버튼 모두 같은 입력 폼으로 가고, 도착지만 `?next=fortune|saju` 쿼리로 전달됩니다.
  파라미터가 없으면 기존과 같이 `/fortune` — 기존 링크·북마크는 그대로 동작합니다.
- '나의 사주는' 상단에 '오늘의 운세 확인하기' 칩. 운세 화면의 '내 사주 정보' 칩과 짝을 이룹니다.
- 로딩 스켈레톤(`Skeleton.tsx`)과 라우트별 `loading.tsx`.
- 만세력 지연 로더 `loadManse()` / `isManseReady()` 와 게이트 훅 `useManse`.

### Changed

- **만세력(`lunar-javascript`)을 지연 로딩으로 전환.** gzip 100 kB 짜리 UMD 모놀리스가
  초기 번들에 통째로 들어 있었습니다. First Load JS: `/fortune` 222 → 123 kB,
  `/saju` 218 → 119 kB.
- **폰트를 `next/font` 로 셀프 호스팅.** `<link>` 방식의 외부 왕복 두 번을 없앴습니다.
  한글 unicode-range 슬라이스가 웨이트당 120개 넘어 `preload` 는 껐습니다.
  웨이트도 400·500·700·900 → 400·700 으로 정리(500·900 은 각 두 군데서만 사용).
- **화면 전환 로딩을 전역 스피너 오버레이에서 라우트별 스켈레톤으로 교체.**
  최소 노출 450ms 하한이 사라져, 전환이 빠르면 스켈레톤도 그만큼 짧게 스칩니다.
- `SajuChart` 의 명식·오행·십성·세운 계산을 `useMemo` 로 묶었습니다.
  오행/십성 패널을 토글할 때마다 `computeSaju` 가 두 번씩 다시 돌던 것을 제거.
- 스크롤바를 숨김(`width: 0`)에서 테마에 맞는 얇은 커스텀 스크롤바로 교체.
  `.scroll` · `.hour-menu` · `.release-list` 규칙을 하나로 일원화.
- 시작 화면 진입 버튼의 톤을 완화하고(꽉 찬 그라데이션 → 옅은 틴트) 크기 축소, 하단 여백 확대.
- 홈 히어로 문구와 브랜드마크 수정("오늘의 사주" → "FortunePot").

### Fixed

- 홈 화면이 쓰지도 않는 사주 데이터의 하이드레이션을 기다리며 스피너를 띄우던 문제.
  정적으로 프리렌더한 내용을 자기가 가리고 있었습니다.
- 만세력 청크 로딩이 실패하면 화면이 스켈레톤에서 멈추던 문제 — 3회까지 재시도합니다.
  (지연 로딩으로 새로 생긴 실패 경로)

### Removed

- `LoadingOverlay` 컴포넌트와 `.loading-overlay` 계열 CSS.
- `useUIStore` 의 전역 로딩 상태(`loading` / `loadingSince` / `loadingFrom` /
  `startLoading` / `stopLoading`) — 오버레이가 사라져 참조가 없어졌습니다.
  이에 따라 화면 전환 중 조작 차단도 없어집니다.

## [0.5.0] - 2026-08-06

### Added

- 업데이트 소식 기능 — 안 본 릴리즈가 있으면 말풍선과 점으로 알리고, 눌러서 릴리즈 노트를 볼 수 있어요.
  메뉴가 있는 화면에서는 확성기가 LNB 안으로 들어가고 햄버거가 알림 진입점을 맡습니다.
- 변경 이력 문서(`CHANGELOG.md`)와 앱 내 릴리즈 노트(`src/lib/releases.ts`) 도입.
- 파비콘·앱 아이콘 3종(`favicon.ico`, `icon.svg`, `apple-icon.png`) 추가.
- '나의 사주는' 화면에 메뉴와 '오늘의 운세' 바로가기 추가.
- 화면 전환 전역 로딩 오버레이 — 전환 중 조작을 차단하고 진행 중임을 표시합니다.
  App Router가 클라이언트 내비게이션 전환 이벤트를 노출하지 않아 `useNav` 훅으로 직접 처리합니다.

### Changed

- 클레이 마법사 캐릭터 SVG 5종 교체.
- 텍스트와 가로로 배치되는 영역에서 캐릭터 폭을 40%로 제한.
- 업데이트 소식 시트의 닫기를 X 버튼으로 일원화(하단 '확인했어요' 제거).

### Fixed

- 새 SVG에 `class="char"`가 없어 `ClayChar`의 문자열 치환이 no-op이 되면서
  캐릭터의 크기·애니메이션·그림자 CSS가 전부 적용되지 않던 문제.
- SVG 교체 과정에서 누락된 `role="img"` / `aria-label` 복원.
- LNB 닫기(X) 버튼의 아이콘이 중앙에서 밀려 보이던 정렬 문제.

## [0.4.0] - 2026-08-05

### Changed

- 일일 운세 산식을 개편해 같은 사주라도 날마다 결과가 더 다양하게 나옵니다.

## [0.3.0] - 2026-06-26

### Added

- 사주 풀이 상세 내용을 대폭 보강했어요 (오행·십성 해설).

### Changed

- 사주 정보 입력·조회 UX 개편 — 운세 화면 상단 칩에서 바텀시트로 정보 확인·수정.

### Fixed

- iOS Safari에서 생년월일 입력 필드의 너비·정렬이 어긋나던 문제를 고쳤어요.

### Removed

- 사용하지 않던 Supabase·로그인 관련 코드를 제거했습니다. (게스트 전용 앱으로 확정)

## [0.2.0] - 2026-06-19

### Added

- `lunar-javascript` 만세력 도입 — 입춘·절입 시각과 23시 자시 경계를 반영합니다.
- 진태양시(경도·균시차) 보정 적용 — 서울 경도 기준으로 환산해 명식을 산출합니다.

### Changed

- 운세를 이름 seed 기반에서 **사주 기반 생성**으로 전환했습니다.

## [0.1.0] - 2026-06-18

### Added

- 첫 릴리즈 — 사주 정보 입력, 오늘의 운세, 나의 사주는(명식·오행·십성) 화면.
- 게스트 저장(localStorage), 공통 레이아웃·컴포넌트, 페이지 라우팅.

[Unreleased]: https://github.com/limEnough/fortune-pot/compare/v0.6.0...HEAD
[0.6.0]: https://github.com/limEnough/fortune-pot/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/limEnough/fortune-pot/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/limEnough/fortune-pot/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/limEnough/fortune-pot/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/limEnough/fortune-pot/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/limEnough/fortune-pot/releases/tag/v0.1.0
