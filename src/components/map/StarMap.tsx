"use client";
import { useMemo } from "react";
import { ROLES, type RoleKey } from "@/lib/saju/chemi";
import { OH_COLOR, type Ohaeng } from "@/lib/saju/constants";
import type { MapMember, MapOwner } from "@/lib/map/types";

/*
 * 관계 지도 — 나를 항성으로 둔 행성계.
 *
 * 자리는 두 값으로 정해진다.
 *   - 각도 = 유형. 다섯 유형이 오행 다섯과 1:1 이라 하늘을 다섯 구역으로 나눌 수 있다.
 *   - 거리 = 케미. 점수가 높을수록 안쪽 궤도를 돈다.
 * 크기·밝기도 케미를 따른다. 그래서 "누가 가까운 사람인지" 를 숫자를 읽기 전에 본다.
 *
 * 궤도는 정원이 아니라 **기울어진 타원**이다. 위에서 내려다본 원판처럼 보여야
 * 평면 과녁이 아니라 공간에 놓인 계로 읽힌다. 행성 좌표도 궤도와 똑같은 변환을
 * 거치므로(pos 함수) 언제나 자기 궤도 위에 정확히 앉는다.
 *
 * 원·궤도·먼지는 SVG(viewBox 100×100, 컨테이너가 정사각형이라 늘어나지 않는다),
 * 글자가 들어가는 것(행성 이름·유형 뱃지·가운데)은 HTML 로 겹쳐 둔다.
 * SVG 안의 텍스트는 알약 배경·줄임 처리를 CSS 로 다루기가 번거롭다.
 */

const CENTER = 50;
const R_NEAR = 17; // 케미 99
const R_FAR = 40; // 케미 32
const R_BADGE = 46; // 유형 뱃지가 앉는 바깥 테두리
const RAD = Math.PI / 180;

/** 궤도면 기울기 — 납작한 정도와 회전 */
const FLAT = 0.8;
const TILT = -12;

/** 유형별 기준 각도 — 귀인이 열두시, 시계 방향으로 ROLES 순서 */
const roleAngle = (i: number) => -90 + i * 72;

/** 궤도 위의 한 점. 타원을 눕히고(FLAT) 기울인(TILT) 좌표계를 쓴다 */
function pos(deg: number, r: number) {
  const a = deg * RAD;
  const t = TILT * RAD;
  const x = r * Math.cos(a);
  const y = r * Math.sin(a) * FLAT;
  return {
    x: CENTER + x * Math.cos(t) - y * Math.sin(t),
    y: CENTER + x * Math.sin(t) + y * Math.cos(t),
  };
}

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
    const r = 6 + rnd() * 44;
    const q = rnd();
    return {
      x: CENTER + r * Math.cos(a * RAD),
      y: CENTER + r * Math.sin(a * RAD),
      r: 0.22 + q * 0.5,
      o: 0.16 + rnd() * 0.5,
      // 가장 큰 몇 개만 십자 광채를 준다 — 다 주면 지저분해진다
      glint: q > 0.93,
    };
  });
}
const DUST = dust(54);

interface Placed extends MapMember {
  x: number;
  y: number;
  /** 행성 지름(%) */
  size: number;
  /** 궤도 반지름 */
  orbit: number;
  /** 앞쪽(아래)일수록 크게 — 깊이감 */
  depth: number;
  /** 이름표를 위로 넘길지 */
  up: boolean;
}

function place(members: MapMember[]): Placed[] {
  const out: Placed[] = [];
  ROLES.forEach((role, i) => {
    const group = members.filter((m) => m.role === role.key);
    const k = group.length;
    const step = Math.min(21, 54 / Math.max(k, 1));
    group.forEach((m, j) => {
      // 같은 구역에 여럿이면 기준선 좌우로 벌리고, 궤도도 살짝 어긋내 겹침을 줄인다
      const deg = roleAngle(i) + (j - (k - 1) / 2) * step;
      const t = (m.score - 32) / 67;
      const orbit = R_FAR - t * (R_FAR - R_NEAR) + (j % 2 ? 2.4 : 0);
      const p = pos(deg, orbit);
      // 아래로 내려온 행성이 앞에 있다고 본다
      const depth = 0.92 + ((p.y - CENTER) / 40) * 0.12;
      out.push({
        ...m,
        ...p,
        orbit,
        depth,
        size: (10.5 + t * 3.5) * depth,
        up: p.y > 56,
      });
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
  // 케미 1등에게만 고리를 둘러 한눈에 찾게 한다
  const topId = useMemo(
    () => placed.reduce<Placed | null>((a, b) => (!a || b.score > a.score ? b : a), null)?.id,
    [placed],
  );

  return (
    <div className="starmap-wrap">
      <div className="starmap">
        <svg viewBox="0 0 100 100" className="sm-sky" aria-hidden="true">
          <defs>
            <radialGradient id="sm-core">
              <stop offset="0%" stopColor={ownerColor} stopOpacity="0.42" />
              <stop offset="55%" stopColor={ownerColor} stopOpacity="0.1" />
              <stop offset="100%" stopColor={ownerColor} stopOpacity="0" />
            </radialGradient>
          </defs>

          {DUST.map((d, i) => (
            <g key={i}>
              <circle cx={d.x} cy={d.y} r={d.r} fill="#fff" opacity={d.o} />
              {d.glint && (
                <path
                  d={`M${d.x - 1.6} ${d.y}h3.2M${d.x} ${d.y - 1.6}v3.2`}
                  stroke="#fff"
                  strokeWidth="0.18"
                  opacity={d.o * 0.7}
                />
              )}
            </g>
          ))}

          {/* 궤도 — 행성마다 자기 것을 하나씩. 같은 반지름은 한 번만 그린다 */}
          <g transform={`rotate(${TILT} ${CENTER} ${CENTER})`}>
            {Array.from(new Set(placed.map((p) => p.orbit.toFixed(1)))).map((r) => (
              <ellipse
                key={r}
                cx={CENTER}
                cy={CENTER}
                rx={+r}
                ry={+r * FLAT}
                fill="none"
                stroke="rgba(167,139,250,.26)"
                strokeWidth="0.22"
                strokeDasharray="1.1 2.2"
              />
            ))}
            {/* 아무도 없을 때도 계가 비어 보이지 않게 안내 궤도를 둔다 */}
            {placed.length === 0 &&
              [22, 31, 39].map((r) => (
                <ellipse
                  key={r}
                  cx={CENTER}
                  cy={CENTER}
                  rx={r}
                  ry={r * FLAT}
                  fill="none"
                  stroke="rgba(167,139,250,.16)"
                  strokeWidth="0.22"
                  strokeDasharray="1.1 2.2"
                />
              ))}
          </g>

          <circle cx={CENTER} cy={CENTER} r="26" fill="url(#sm-core)" />

          {/* 고른 행성에만 빛줄기 — 선을 다 그으면 궤도가 묻힌다 */}
          {placed
            .filter((p) => p.id === selected)
            .map((p) => (
              <line
                key={p.id}
                x1={CENTER}
                y1={CENTER}
                x2={p.x}
                y2={p.y}
                stroke={p.color}
                strokeOpacity="0.75"
                strokeWidth="0.4"
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

        <div className="sm-me" style={{ left: pct(CENTER), top: pct(CENTER) }}>
          <i className="sm-corona" style={{ background: ownerColor }} />
          <span className="sm-core" style={{ background: ownerColor }}>
            <b>{owner.ohaeng}</b>
            <small>나</small>
          </span>
        </div>

        {placed.map((p, i) => (
          <button
            key={p.id}
            type="button"
            className={`sm-planet focusable ${p.up ? "up" : ""} ${selected === p.id ? "on" : ""}`}
            style={{
              left: pct(p.x),
              top: pct(p.y),
              width: pct(p.size),
              height: pct(p.size),
              // 같은 리듬으로 같이 흔들리면 기계처럼 보인다
              animationDelay: `${(i % 5) * -1.7}s`,
            }}
            onClick={() => onSelect?.(p.id)}
            aria-label={`${p.name} · ${p.ohaeng} · 케미 ${p.score}`}
          >
            <span
              className="sm-body"
              style={{
                background: `radial-gradient(circle at 32% 28%, rgba(255,255,255,.72), rgba(255,255,255,0) 58%), ${p.color}`,
                boxShadow: `0 0 ${5 + (p.score / 99) * 15}px ${p.color}`,
                opacity: 0.6 + (p.score / 99) * 0.4,
              }}
            >
              <span className="sm-oh">{p.ohaeng}</span>
            </span>
            {p.id === topId && <span className="sm-ring" style={{ borderColor: p.color }} />}
            <span className="sm-name">{p.name}</span>
          </button>
        ))}
      </div>

      <p className="sm-cap">가운데에 가까울수록, 행성이 밝을수록 케미가 좋은 사람</p>
    </div>
  );
}
