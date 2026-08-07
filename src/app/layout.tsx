import type { Metadata, Viewport } from "next";
import { Jua, Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/AppShell";

/*
 * 폰트는 next/font 로 셀프 호스팅한다. <link> 방식은 fonts.googleapis.com →
 * fonts.gstatic.com 두 번의 왕복이 렌더를 막고, CSS 를 받기 전엔 폰트 요청조차
 * 시작되지 않는다.
 *
 * Noto Sans KR 은 웨이트당 @font-face 가 120개 넘게 쪼개져 있어(한글 unicode-range)
 * preload 를 켜면 전부 preload 태그가 붙는다. 실제로는 화면에 쓰인 글자가 속한
 * 슬라이스만 받으면 되므로 preload 는 끈다.
 *
 * 웨이트는 400/700 만. 500·900 은 각각 두 군데서만 쓰던 걸 정리했다.
 */
const jua = Jua({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
});

const notoSansKR = Noto_Sans_KR({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
  preload: false,
});

export const metadata: Metadata = {
  title: "포춘팟 — 오늘의 사주",
  description: "사주로 보는 오늘의 운세",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={`${jua.variable} ${notoSansKR.variable}`}>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
