import { redirect } from "next/navigation";

/**
 * 예전 입력 화면 주소.
 *
 * `/onboarding` 하나가 "보러 가는 길목"과 "정보 고치기"를 겸하다 `/infoinput` ·
 * `/info` 로 갈라졌다. 북마크나 예전 링크가 죽지 않게 길목 쪽으로 넘긴다.
 */
export default async function OnboardingRedirect({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  redirect(next ? `/infoinput?next=${encodeURIComponent(next)}` : "/infoinput");
}
