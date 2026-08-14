"use client";
import { useMemo } from "react";
import { ROLES, type RoleKey } from "@/lib/saju/chemi";
import { OH_COLOR, type Ohaeng } from "@/lib/saju/constants";
import type { MapMember, MapOwner } from "@/lib/map/types";

/*
 * 별지도.
 *
 * 가운데가 나(달)이고, 지도에 올라온 사람이 별로 뜬다. 자리는 두 값으로 정해진다.
 *   - 각도 = 유형. 다섯 유형이 오행 다섯과 1:1 이라 하늘을 다섯 구역으로 나눌 수 있다.
 *   - 거리 = 케미. 점수가 높을수록 달에 가깝다.
 * 밝기·크기도 케미를 따른다. 그래서 "누가 가까운 사람인지"를 숫자를 읽기 전에 본다.
 *
 * 원·선·먼지는 SVG(viewBox 100×100, 컨테이너가 정사각형이라 늘어나지 않는다),
 * 글자가 들어가는 것(별 이름·유형 뱃지·가운데 달)은 HTML 로 겹쳐 둔다.
 * SVG 안의 텍스트는 알약 배경·줄임 처리를 CSS 로 다루기가 번거롭다.
 */

const CENTER = 50;
const R_NEAR = 16;  // 케미 99
const R_FAR = 38;   // 케미 32
const R_BADGE = 45; // 유형 뱃지가 앉는 바깥 테두리
const RAD = Math.PI / 180;

/** 유형별 기준 각도 — 귀인이 열두시, 시계 방향으로 ROLES 순서 */
const roleAngle = (i: number) => -90 + i * 72;

const pos = (deg: number, r: number) => ({
  x: CENTER + r * Math.cos(deg * RAD),
  y: CENTER + r * Math.sin(deg * RAD),
});

const pct = (n: number) => `${n}%`;

/**
 * 테두리에 앉는 뱃지는 가운데 정렬하면 지도 밖으로 잘린다.
 * 바깥쪽 모서리를 기준으로 붙여 안쪽으로 눕힌다.
 */
function edgeAnchor(x: number, y: number) {
  const tx = x < 25 ? "0" : x > 75 ? "-100%" : "-50%";
  const ty = y < 25 ? "0" : y > 75 ? "-100%" : "-50%";
  return `translate(${tx}, ${ty})`;
}

/** 고정 시드 난수 — 별먼지가 렌더마다 바뀌면 하이드레이션이 어긋난다 */
function dust(n: number) {
  let s = 20240816;
  const rnd = () => ((s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  return Array.from({ length: n }, () => {
    const a = rnd() * 360;
    const r = 8 + rnd() * 40;
    return { ...pos(a, r), r: 0.25 + rnd() * 0.5, o: 0.18 + rnd() * 0.5 };
  });
}
const DUST = dust(46);

interface Placed extends MapMember {
  x: number;
  y: number;
  /** 별 크기(%) */
  size: number;
}

function place(members: MapMember[]): Placed[] {
  const out: Placed[] = [];
  ROLES.forEach((role, i) => {
    const group = members.filter((m) => m.role === role.key);
    const k = group.length;
    const step = Math.min(21, 54 / Math.max(k, 1));
    group.forEach((m, j) => {
      // 같은 구역에 여럿이면 기준선 좌우로 벌리고, 거리도 살짝 어긋내 겹침을 줄인다
      const deg = roleAngle(i) + (j - (k - 1) / 2) * step;
      const t = (m.score - 32) / 67;
      const r = R_FAR - t * (R_FAR - R_NEAR) + (j % 2 ? 2.4 : 0);
      out.push({ ...m, ...pos(deg, r), size: 11 + t * 3.5 });
    });
  });
  return out;
}

interface Props {
  owner: MapOwner;
  members: MapMember[];
  selected?: string | null;
  onSelect?: (id: string) => void;
}

export default function StarMap({ owner, members, selected, onSelect }: Props) {
  const placed = useMemo(() => place(members), [members]);
  const counts = useMemo(() => {
    const c = {} as Record<RoleKey, number>;
    ROLES.forEach((r) => (c[r.key] = members.filter((m) => m.role === r.key).length));
    return c;
  }, [members]);

  const ownerColor = OH_COLOR[owner.ohaeng as Ohaeng]?.c ?? "#fcd34d";

  return (
    <div className="starmap-wrap">
      <div className="starmap">
        <svg viewBox="0 0 100 100" className="sm-sky" aria-hidden="true">
          <defs>
            <radialGradient id="sm-core">
              <stop offset="0%" stopColor={ownerColor} stopOpacity="0.34" />
              <stop offset="100%" stopColor={ownerColor} stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* 다섯 구역 — 경계선만 옅게 그어 어디가 어느 유형인지 알린다 */}
          {ROLES.map((r, i) => {
            const p = pos(roleAngle(i) - 36, 47);
            return (
              <line
                key={r.key}
                x1={CENTER} y1={CENTER} x2={p.x} y2={p.y}
                stroke={r.color} strokeOpacity="0.13" strokeWidth="0.4"
              />
            );
          })}

          {[20, 30, 40].map((r) => (
            <circle
              key={r} cx={CENTER} cy={CENTER} r={r}
              fill="none" stroke="rgba(167,139,250,.2)" strokeWidth="0.28" strokeDasharray="1.2 2.4"
            />
          ))}

          {DUST.map((d, i) => (
            <circle key={i} cx={d.x} cy={d.y} r={d.r} fill="#fff" opacity={d.o} />
          ))}

          <circle cx={CENTER} cy={CENTER} r="24" fill="url(#sm-core)" />

          {placed.map((p) => (
            <line
              key={p.id}
              x1={CENTER} y1={CENTER} x2={p.x} y2={p.y}
              stroke={p.color}
              strokeOpacity={selected === p.id ? 0.85 : 0.3}
              strokeWidth={selected === p.id ? 0.6 : 0.35}
            />
          ))}
        </svg>

        {ROLES.map((r, i) => {
          const p = pos(roleAngle(i), R_BADGE);
          return (
            <span
              key={r.key}
              className={`sm-badge ${counts[r.key] ? "on" : ""}`}
              style={{
                left: pct(p.x),
                top: pct(p.y),
                transform: edgeAnchor(p.x, p.y),
                borderColor: r.color,
                color: r.color,
              }}
            >
              {r.emoji} {r.label}
              {counts[r.key] > 0 && <b>{counts[r.key]}</b>}
            </span>
          );
        })}

        <div
          className="sm-me"
          style={{ left: pct(CENTER), top: pct(CENTER), background: ownerColor }}
        >
          <b>{owner.ohaeng}</b>
          <small>나</small>
        </div>

        {placed.map((p) => (
          <button
            key={p.id}
            type="button"
            /* 아래쪽 별은 이름표를 위로 넘긴다 — 지도 밖으로 잘리지 않게 */
            className={`sm-star focusable ${p.y > 55 ? "up" : ""} ${selected === p.id ? "on" : ""}`}
            style={{
              left: pct(p.x),
              top: pct(p.y),
              width: pct(p.size),
              height: pct(p.size),
              background: p.color,
              boxShadow: `0 0 ${6 + (p.score / 99) * 16}px ${p.color}`,
              opacity: 0.55 + (p.score / 99) * 0.45,
            }}
            onClick={() => onSelect?.(p.id)}
            aria-label={`${p.name} · ${p.ohaeng} · 케미 ${p.score}`}
          >
            <span className="sm-oh">{p.ohaeng}</span>
            <span className="sm-name">{p.name}</span>
          </button>
        ))}
      </div>

      <p className="sm-cap">달에 가까울수록, 별이 밝을수록 케미가 좋은 사람</p>
    </div>
  );
}
