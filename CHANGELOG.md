# 변경 이력

이 파일의 형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.1.0/)를 따르며,
버전 규칙은 [유의적 버전(SemVer)](https://semver.org/lang/ko/)을 따릅니다.

> 앱 안에서 보여주는 릴리즈 노트는 `src/lib/releases.ts`에 있습니다.
> 여기에 새 버전을 추가하면 그쪽도 함께 갱신해 주세요. (사용자 눈높이 문장으로)

## [Unreleased]

> 아직 태그가 없습니다. 릴리즈할 때 이 섹션을 `## [0.5.0] - YYYY-MM-DD` 로 바꾸고
> 맨 아래 비교 링크를 갱신하세요.

### Added

- 헤더에 확성기 버튼 추가 — 새 업데이트가 있으면 말풍선으로 알리고, 누르면 릴리즈 노트를 볼 수 있어요.
- 변경 이력 문서(`CHANGELOG.md`)와 앱 내 릴리즈 노트(`src/lib/releases.ts`) 도입.

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

[Unreleased]: https://github.com/limEnough/fortune-pot/compare/v0.4.0...HEAD
[0.4.0]: https://github.com/limEnough/fortune-pot/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/limEnough/fortune-pot/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/limEnough/fortune-pot/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/limEnough/fortune-pot/releases/tag/v0.1.0
