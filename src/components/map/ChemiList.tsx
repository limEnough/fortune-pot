"use client";
import { ROLE_MAP } from "@/lib/saju/chemi";
import type { MapMember } from "@/lib/map/types";

const MEDAL = ["🥇", "🥈", "🥉"];

interface Props {
  members: MapMember[];
  openId: string | null;
  onToggle: (id: string) => void;
  onRemove: (m: MapMember) => void;
}

/**
 * 케미 나래비 — 잘 맞는 순.
 *
 * 지도는 한눈에 보는 그림이고, 이 목록이 근거를 댄다. 유형·오행 관계·조심할 점은
 * 펼쳤을 때만 나온다. 접힌 줄에서는 이름과 숫자만 보여 훑기 좋게 둔다.
 */
export default function ChemiList({ members, openId, onToggle, onRemove }: Props) {
  return (
    <ul className="chemi-list">
      {members.map((m, i) => {
        const role = ROLE_MAP[m.role];
        const open = openId === m.id;
        return (
          <li key={m.id} className={`chemi ${open ? "open" : ""}`}>
            <button
              className="chemi-row focusable"
              onClick={() => onToggle(m.id)}
              aria-expanded={open}
            >
              <span className="rank">{MEDAL[i] ?? i + 1}</span>
              <span className="oh" style={{ background: m.color }}>
                {m.ohaeng}
              </span>
              <span className="who">
                <b>
                  {m.name} <span className="nick">{m.emoji} {m.nick}</span>
                </b>
                <span className="role" style={{ color: role.color }}>
                  {role.emoji} {role.gist}
                </span>
              </span>
              <span className="score">
                케미 <b>{m.score}</b>
              </span>
              <svg className="chev" width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            {open && (
              <div className="chemi-body">
                <div className="rel">{m.relation}</div>
                <p>{m.line}</p>
                <p className="caution">
                  <b>조심할 점</b>
                  {m.caution}
                </p>
                <button className="link-btn focusable" onClick={() => onRemove(m)}>
                  지도에서 지우기
                </button>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
