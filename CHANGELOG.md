# 변경 이력

이 파일의 형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.1.0/)를 따르며,
버전 규칙은 [유의적 버전(SemVer)](https://semver.org/lang/ko/)을 따릅니다.

> 앱 안에서 보여주는 릴리즈 노트는 `src/lib/releases.ts`에 있습니다.
> 여기에 새 버전을 추가하면 그쪽도 함께 갱신해 주세요. (사용자 눈높이 문장으로)

## [Unreleased]

> 다음 릴리즈에 나갈 변경을 여기에 쌓습니다.
> 릴리즈할 때 이 섹션을 `## [x.y.z] - YYYY-MM-DD` 로 바꾸고 맨 아래 비교 링크를 추가하세요.

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

[Unreleased]: https://github.com/limEnough/fortune-pot/compare/v0.5.0...HEAD
[0.5.0]: https://github.com/limEnough/fortune-pot/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/limEnough/fortune-pot/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/limEnough/fortune-pot/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/limEnough/fortune-pot/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/limEnough/fortune-pot/releases/tag/v0.1.0
