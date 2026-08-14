"use client";
import { useState } from "react";
import { useNav } from "@/hooks/useNav";
import { useMapStore } from "@/store/useMapStore";
import { ROLE_MAP } from "@/lib/saju/chemi";
import JoinForm from "./JoinForm";
import type { JoinInput, JoinResult } from "@/lib/map/types";

/**
 * 공유 링크로 들어온 사람이 보는 화면.
 *
 * 이름을 올리면 곧바로 "나는 OO님에게 어떤 사람인가"를 돌려준다. 올린 사람도
 * 뭔가 얻어가야 링크가 한 번 더 굴러가기 때문이다. 남의 지도 전체(다른 사람들)는
 * 보여주지 않는다 — 그건 주인 것이다.
 */
export default function JoinPanel({
  id, ownerName, count,
}: { id: string; ownerName: string; count: number }) {
  const nav = useNav();
  const myId = useMapStore((s) => s.id);
  const [result, setResult] = useState<JoinResult | null>(null);

  const submit = async (input: JoinInput) => {
    const res = await fetch(`/api/map/${id}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error((body as { message?: string }).message ?? "잠시 후 다시 시도해 주세요.");
    setResult(body as JoinResult);
  };

  if (result) {
    const m = result.member;
    const role = ROLE_MAP[m.role];
    return (
      <div className="join-result">
        <div className="jr-badge" style={{ borderColor: role.color, color: role.color }}>
          {role.emoji} {role.label}
        </div>
        <h2 className="jr-title">
          {m.name}님은 {result.ownerName}님에게
          <br />
          <b style={{ color: role.color }}>{role.gist}</b>이에요
        </h2>

        <div className="jr-score" style={{ background: m.color }}>
          <b>{m.score}</b>
          <small>케미</small>
        </div>

        <div className="jr-rel">{m.relation}</div>
        <p className="jr-line">{m.line}</p>
        <p className="jr-mirror">
          <b>{result.ownerName}님 입장에선</b>
          {m.mirror}
        </p>
        <p className="jr-note">
          {result.ownerName}님 지도에 <b>{result.sameRole}번째 {role.label}</b>으로 올라갔어요.
          지도에는 이름과 유형만 보여요.
        </p>

        <button className="btn primary block focusable" onClick={() => nav.push("/map")}>
          나도 내 귀인지도 그리기
        </button>
      </div>
    );
  }

  if (myId === id) {
    return (
      <div className="map-empty">
        <p>
          내 지도 링크예요.<br />
          이 링크를 친구에게 보내면 친구가 별로 올라와요.
        </p>
        <button className="btn primary focusable" onClick={() => nav.push("/map")}>
          내 지도 보기
        </button>
      </div>
    );
  }

  return (
    <JoinForm
      title={<>🙋 나는 {ownerName}님에게 어떤 사람일까?</>}
      desc={
        <>
          생일만 넣으면 바로 나와요. 지도에는 이름과 유형만 보여요.
          생일은 {ownerName}님이 나와의 궁합을 볼 때만 쓰여요.
          {count > 0 && <> 지금까지 {count}명이 올라와 있어요.</>}
        </>
      }
      submitLabel="지도에 이름 올리기"
      busyLabel="궁합 보는 중…"
      onSubmit={submit}
    />
  );
}
