# 포춘팟 (FortunePot)

"사주로 보는 오늘의 운세" 모바일웹 — Next.js(App Router) + TypeScript + Tailwind + Zustand.

> 현재 버전은 **비회원(게스트) 모드**로 동작합니다. 사주 정보는 브라우저(localStorage)에
> 저장되며, **로그인·계정 동기화 기능은 추후 연동 예정**입니다. (Supabase 연동 코드는
> 각 파일에 주석으로 보관되어 있어 그대로 되살릴 수 있습니다.)

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
    page.tsx              메인(사주 있으면 운세로 이동, 없으면 시작 화면)
    onboarding/           사주 입력 폼
    fortune/              오늘의 운세 + 사주 정보 바텀시트 트리거
    saju/                 나의 사주는 (명식·오행·십성·세운/월운)
    account/              (추후 로그인 연동 예정 — 현재 홈으로 이동)
    auth/callback/        (추후 로그인 연동 예정 — 현재 비활성화)
  components/
    ClayChar / StarField / AppShell        공통 UI·연출
    TopBar / NavDrawer                     상단바·메뉴 드로어
    SajuForm / FortuneCard / SajuChart     입력·운세·명식
    SajuInfoSheet                          사주 정보 확인 바텀시트
    LoginSheet                             (추후 로그인 연동 예정 — 현재 비활성화)
  lib/saju/               calc(명식·십성), fortune(운세), text(해설), constants
  lib/clay/               캐릭터 5종 SVG
  lib/supabase/           browser/server 클라이언트 (로그인 연동 대비 보관)
  store/                  Zustand (게스트 사주 persist / UI 드로어)
  hooks/useSaju.ts        사주 정보 읽기·저장 통합 훅(현재 게스트 저장소 사용)
middleware.ts             현재 통과(no-op) — 로그인 연동 시 세션 갱신용으로 활성화
supabase/schema.sql       saju_profiles 테이블 + RLS (로그인 연동 시 사용)
```

## 데이터 전략
- **계산 로직**(명식·십성·세운) → 코드(`lib/saju`). 저장하지 않음.
- **사용자 입력**(생년월일시) → 현재는 Zustand persist(localStorage)에 보관.
- **오늘의 운세** → 이름+날짜 seed로 매번 계산(저장 안 함).
- 해설 문구는 `lib/saju/text.ts`. 자주 바꾸거나 다국어가 필요해지면 DB/CMS로 이전.

## 로그인 기능 연동 (추후 예정)
회원 로그인·계정 동기화를 붙일 때는 다음을 되살리면 됩니다.
1. `.env.local` 에 백엔드 키 입력 (예시는 `.env.example` 참고)
2. `supabase/schema.sql` 실행 (saju_profiles + RLS)
3. 각 파일의 "원본(보관용)" 주석 해제:
   `hooks/useSaju.ts`, `components/LoginSheet.tsx`, `components/NavDrawer.tsx`(계정/로그아웃),
   `app/page.tsx`(로그인 버튼), `app/account/page.tsx`, `app/auth/callback/route.ts`, `middleware.ts`
4. 게스트로 입력한 사주는 로그인 시 서버로 동기화하도록 `useSaju.save`에서 연결

## ⚠️ 사주 계산 주의
명식·세운 계산은 [`lunar-javascript`](https://github.com/6tail/lunar-javascript) 만세력을 사용하며(입춘·각월 절입 시각, 23시 자시 경계 반영), 한국 표준시 입력을 **서울 경도 기준 진태양시(균시차 포함)**로 환산해 명식을 산출합니다.
출생지 경도가 서울과 크게 다르거나 시지 경계 부근이면 별도 보정이 필요할 수 있습니다.

## 배포 (Vercel)
- Vercel 프로젝트로 import 후 그대로 배포(현재는 환경변수 불필요)
- 로그인 연동 이후에는 백엔드 키와 콜백 URL 설정을 추가
