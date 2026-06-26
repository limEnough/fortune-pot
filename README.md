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
    TopBar / NavDrawer                     상단바·메뉴 드로어
    SajuForm / FortuneCard / SajuChart     입력·운세·명식
    SajuInfoSheet                          사주 정보 확인 바텀시트
  lib/saju/               calc(명식·십성), fortune(운세), text(해설), constants
  lib/clay/               캐릭터 5종 SVG
  store/                  Zustand (게스트 사주 persist / UI 드로어)
  hooks/useSaju.ts        사주 정보 읽기·저장 통합 훅
```

## 데이터 전략
- **계산 로직**(명식·십성·세운) → 코드(`lib/saju`). 저장하지 않음.
- **사용자 입력**(생년월일시) → Zustand persist(localStorage)에 보관.
- **오늘의 운세** → 이름+날짜 seed로 매번 계산(저장 안 함).
- 해설 문구는 `lib/saju/text.ts`. 자주 바꾸거나 다국어가 필요해지면 DB/CMS로 이전.

## ⚠️ 사주 계산 주의
명식·세운 계산은 [`lunar-javascript`](https://github.com/6tail/lunar-javascript) 만세력을 사용하며(입춘·각월 절입 시각, 23시 자시 경계 반영), 한국 표준시 입력을 **서울 경도 기준 진태양시(균시차 포함)**로 환산해 명식을 산출합니다.
출생지 경도가 서울과 크게 다르거나 시지 경계 부근이면 별도 보정이 필요할 수 있습니다.

## 배포 (Vercel)
Vercel 프로젝트로 import 후 그대로 배포 — 환경변수 설정 없음.
