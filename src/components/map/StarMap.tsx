"use client";
import { useMemo } from "react";
import { ROLES } from "@/lib/saju/chemi";
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
 * 사람이 늘면 자리가 좁아진다. 각도는 구역 폭(54°) 안에 묶여 있어서 옆 유형을
 * 침범하지는 않지만, 그만큼 간격이 1/k 로 줄어든다. 그래서 크기와 이름표를
 * 붐비는 정도에 맞춰 접는다(shrinkToFit·labelFit).
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

/** 행성 지름 하한 — 이보다 작아지면 손가락으로 누를 수 없다 */
const MIN_SIZE = 6;

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

/*
 * 겹침 판정에 쓰는 상자들.
 *
 * 이름표·뱃지는 px 로 고정된 알약이라(글자 10.5px, 좌우 여백) 보드가 좁을수록
 * 지도에서 차지하는 비율이 커진다. 그래서 좁은 쪽(모바일 폭)을 기준으로 잰다 —
 * 넓은 화면에서는 실제보다 넉넉하게 잡혀 몇 개 덜 띄우겠지만, 겹쳐서 못 읽는
 * 것보다 낫다.
 */
const BOARD = 340;
const u = (px: number) => (px / BOARD) * 100;

/** 한글·한자·가나는 글자폭이 글자크기와 비슷하고, 로마자는 그 6할쯤 */
const rawW = (s: string) =>
  [...s].reduce((w, c) => w + (/[가-힣぀-ヿ一-鿿]/.test(c) ? 10.5 : 6.2), 0);

const NAME_H = u(22); // 알약 높이(글자 + 위아래 여백 + 테두리)
const NAME_GAP = u(3); // 행성과 알약 사이
/** 이름표를 놓아볼 가로 위치 — 가운데부터, 막히면 좌우로 밀어본다 */
const NAME_NUDGE = [0, 6, -6, 12, -12];

interface Box {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

const hit = (a: Box, b: Box) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;

/** 이름 알약 — 행성 바로 바깥(위 또는 아래)에 붙는다. max-width 84px 로 잘린다 */
function nameBox(p: Placed, up: boolean, dx: number): Box {
  const w = u(Math.min(84, 14 + rawW(p.name)));
  const off = p.size / 2 + NAME_GAP;
  const y0 = up ? p.y - off - NAME_H : p.y + off;
  return { x0: p.x + dx - w / 2, x1: p.x + dx + w / 2, y0, y1: y0 + NAME_H };
}

/**
 * 가운데 '나' 는 원이다. 사각형으로 재면 모서리 쪽 이름표가 억울하게 걸리므로
 * 상자에서 가장 가까운 점까지의 거리로 본다.
 */
function hitsSun(b: Box): boolean {
  const cx = Math.max(b.x0, Math.min(CENTER, b.x1));
  const cy = Math.max(b.y0, Math.min(CENTER, b.y1));
  return Math.hypot(cx - CENTER, cy - CENTER) < 9; // .sm-me 가 폭 18%
}

/** 유형 뱃지 — edgeAnchor 와 같은 규칙으로 테두리에 붙는다 */
function badgeBox(i: number, count: number): Box {
  const p = pos(roleAngle(i), R_BADGE);
  const w = u(18 + 16 + rawW(ROLES[i].label) + (count ? 12 : 0)); // 여백+이모지+글자+인원수
  const h = u(20);
  const x0 = p.x < 25 ? p.x : p.x > 75 ? p.x - w : p.x - w / 2;
  const y0 = p.y < 25 ? p.y : p.y > 75 ? p.y - h : p.y - h / 2;
  return { x0, x1: x0 + w, y0, y1: y0 + h };
}

/** 행성 몸통 — 원을 살짝 줄인 사각형으로 본다(모서리까지 재면 너무 엄격하다) */
function bodyBox(p: Placed): Box {
  const r = (p.size / 2) * 0.85;
  return { x0: p.x - r, x1: p.x + r, y0: p.y - r, y1: p.y + r };
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
  /** 이름표를 가로로 민 거리(지도 단위) — 자리를 찾느라 비켰을 때만 0 이 아니다 */
  nameDx: number;
  /** 이름표를 띄울 자리가 있는지 — 붐비면 접는다 */
  labeled: boolean;
}

/**
 * 붐비는 구역은 통째로 줄인다.
 *
 * 각도가 54° 안에 묶여 있어 사람이 늘수록 간격만 좁아지는데 지름은 그대로여서,
 * 넷만 모여도 서로를 절반씩 덮었다. 가장 가까운 두 별이 겨우 닿을 만큼만 구역
 * 전체에 같은 배율을 먹인다 — 구역 안에서는 여전히 케미가 큰 쪽이 크게 보인다.
 *
 * 하한(MIN_SIZE)에 걸리는 만큼은 겹침이 남는다. 누를 수 없을 만큼 작은 행성은
 * 겹친 행성보다 나쁘기 때문이다. 다만 하한은 행성 하나하나가 아니라 **배율**에
 * 건다 — 각자를 하한으로 잘라버리면 붐비는 구역이 죄다 같은 크기가 되어, 크기로
 * 케미를 읽는다는 약속이 거기서만 깨진다.
 */
function shrinkToFit(group: Placed[]) {
  let f = 1;
  for (let i = 0; i < group.length; i++) {
    for (let j = i + 1; j < group.length; j++) {
      const d = Math.hypot(group[i].x - group[j].x, group[i].y - group[j].y);
      f = Math.min(f, (2 * d) / (group[i].size + group[j].size));
    }
  }
  f = Math.max(f, MIN_SIZE / Math.min(...group.map((p) => p.size)));
  if (f < 1) group.forEach((p) => (p.size *= f));
}

/**
 * 이름표는 자리가 없으면 접는다.
 *
 * 알약이 행성보다 훨씬 넓어서(세 글자면 지름의 서너 배) 같은 구역에 둘만 있어도
 * 서로를 덮었고, 인접 구역끼리도 부딪혔다. 그래서 "몇 명 이상이면 숨긴다" 가
 * 아니라 실제로 놓아보고 판정한다 — 케미가 높은 순으로 자리를 잡고, 이미 놓인
 * 것과 부딪히면 그 사람은 이름을 접는다. 가까운 사람일수록 이름이 남는다.
 *
 * 유형 뱃지·가운데 '나'·행성 몸통도 미리 자리를 차지한 것으로 친다. 그 위에
 * 올라앉은 이름표는 못 읽기는 매한가지다.
 *
 * 접기 전에 자리를 몇 군데 옮겨본다. 안쪽 궤도의 행성은 항성과 바깥 뱃지 사이에
 * 끼어서 위아래가 다 막히는 일이 있는데, 옆으로 조금만 밀면 열린다.
 *
 * 접힌 이름은 눌렀을 때와 아래 '케미 나래비' 에서 볼 수 있다.
 */
function labelFit(all: Placed[], counts: number[]) {
  const taken: Box[] = [...ROLES.map((_, i) => badgeBox(i, counts[i])), ...all.map(bodyBox)];
  const free = (b: Box) =>
    b.x0 > 1 &&
    b.x1 < 99 &&
    b.y0 > 1 &&
    b.y1 < 99 &&
    !hitsSun(b) &&
    !taken.some((t) => hit(t, b));

  for (const p of [...all].sort((a, b) => b.score - a.score)) {
    // 아래가 기본. 지도 밖으로 밀려나는 행성만 위를 먼저 본다
    const down = p.y + p.size / 2 + NAME_GAP + NAME_H <= 97;
    outer: for (const up of down ? [false, true] : [true, false]) {
      for (const dx of NAME_NUDGE) {
        const box = nameBox(p, up, dx);
        if (!free(box)) continue;
        taken.push(box);
        Object.assign(p, { up, nameDx: dx, labeled: true });
        break outer;
      }
    }
  }
}

/** 자리와 구역별 인원 — 뱃지·구역 나누기가 같은 수를 두 번 세지 않게 함께 낸다 */
function place(members: MapMember[]): { placed: Placed[]; counts: number[] } {
  const out: Placed[] = [];
  const groups = ROLES.map((role) => members.filter((m) => m.role === role.key));
  groups.forEach((group, i) => {
    const k = group.length;
    const step = Math.min(21, 54 / Math.max(k, 1));
    const start = out.length;
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
        up: false,
        nameDx: 0,
        labeled: false,
      });
    });
    // slice 가 만드는 건 새 배열일 뿐 원소는 같은 객체다 — 여기서 줄이면 out 도 줄어든다
    shrinkToFit(out.slice(start));
  });

  const counts = groups.map((g) => g.length);
  // 이름표 자리(up·nameDx·labeled)는 크기가 정해진 뒤라야 잡을 수 있다
  labelFit(out, counts);
  return { placed: out, counts };
}

interface Props {
  owner: MapOwner;
  members: MapMember[];
  selected?: string | null;
  onSelect?: (id: string) => void;
}

export default function StarMap({ owner, members, selected, onSelect }: Props) {
  const { placed, counts } = useMemo(() => place(members), [members]);

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
              className={`sm-badge ${counts[i] ? "on" : ""}`}
              style={{
                left: pct(p.x),
                top: pct(p.y),
                transform: edgeAnchor(p.x, p.y),
                borderColor: r.color,
                color: r.color,
              }}
            >
              {r.emoji} {r.label}
              {counts[i] > 0 && <b>{counts[i]}</b>}
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
            {/* 접힌 이름도 누르면 나온다 — 붐빌 때 누가 누군지 확인하는 길 */}
            {(p.labeled || selected === p.id) && (
              <span
                className="sm-name"
                // left 의 % 는 행성 폭 기준이라, 지도 단위를 행성 폭으로 환산해 민다
                style={
                  p.nameDx
                    ? { left: `calc(50% + ${((p.nameDx / p.size) * 100).toFixed(1)}%)` }
                    : undefined
                }
              >
                {p.name}
              </span>
            )}
          </button>
        ))}
      </div>

      <p className="sm-cap">가운데에 가까울수록, 행성이 밝을수록 케미가 좋은 사람</p>
    </div>
  );
}
