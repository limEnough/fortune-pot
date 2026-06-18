"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

/* 계정 기능은 현재 비활성화되어 있습니다(비회원 전용).
   로그인 복구 시 이전 account 페이지 구현을 되살리세요. */
export default function AccountPage() {
  const router = useRouter();
  useEffect(() => { router.replace("/"); }, [router]);
  return null;
}
