"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import TopBar from "@/components/TopBar";
import { RoomSkeletonScreen } from "@/components/Skeleton";
import { useManse } from "@/hooks/useManse";
import { useMyRoom } from "@/hooks/useMyRoom";
import { useNav } from "@/hooks/useNav";
import { useSaju } from "@/hooks/useSaju";
import { ELEMENT_KEYS, ELEMENTS, elementOfIlgan, type ElementKey } from "@/lib/game/elements";
import { computeSaju } from "@/lib/saju/calc";
import ElementCharacter from "./ElementCharacter";

/*
 * 캐릭터를 빚는 화면.
 *
 * 방을 만들기 전에 한 번 들르는 자리다. 예전엔 "내 방 만들기" 버튼 하나짜리
 * 카드였는데, 그러면 **캐릭터가 어떻게 정해졌는지**를 말할 자리가 없었다.
 * 다섯 중 하나가 왜 나인지가 이 서비스의 알맹이라, 결과만 던지지 않고 고르는
 * 과정을 짧게 보여준 뒤 이름과 성정을 소개한다.
 *
 * 연출은 다섯을 빠르게 갈아 끼우다 점점 느려지며 하나에 멎는 방식이다. 슬롯머신과
 * 같은 리듬이라 "지금 정해지는 중" 이 설명 없이 읽힌다. **결과는 처음부터 정해져
 * 있다**(일간에서 나온다) — 연출이 결과를 고르는 게 아니라 결과를 향해 느려진다.
 *
 * 다섯 벌을 모두 DOM 에 올려두고 보이는 것만 바꾼다. 매번 마크업을 갈아 끼우면
 * 12KB 를 다시 파싱하고 필터를 새로 만드느라 리듬이 끊긴다. 안 보이는 넷은
 * display:none 이라 그려지지도 않는다.
 */

interface Props {
  characterMarkups: Record<ElementKey, string>;
}

/** 연출 길이(ms). 넘기면 결과에 멎는다 */
const SPIN_MS = 2000;

export default function CharacterIntro({ characterMarkups }: Props) {
  const nav = useNav();
  const { saju, loading } = useSaju();
  const manseReady = useManse();
  const { ready, hasRoom, create } = useMyRoom();

  const [shown, setShown] = useState<ElementKey>("fire");
  const [settled, setSettled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const spun = useRef(false);

  /** 내 캐릭터 — 일간에서 나온다. 연출과 무관하게 처음부터 정해져 있다 */
  const myElement = useMemo<ElementKey | null>(() => {
    if (!saju || !manseReady) return null;
    return elementOfIlgan(computeSaju(saju.birth, saju.hourIdx).ilgan);
  }, [saju, manseReady]);

  // 사주가 없으면 정할 근거가 없다. 이미 방이 있으면 소개는 지난 일이다
  useEffect(() => {
    if (loading || !ready) return;
    if (!saju) nav.replace("/infoinput?next=room");
    else if (hasRoom) nav.replace("/my-room");
  }, [loading, ready, saju, hasRoom, nav]);

  useEffect(() => {
    if (!myElement || spun.current) return;
    spun.current = true;

    // 모션을 줄여달라고 한 사람에게 2초짜리 깜빡임은 연출이 아니라 방해다
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(myElement);
      setSettled(true);
      return;
    }

    const started = Date.now();
    let step = 0;
    let delay = 70;
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      if (Date.now() - started >= SPIN_MS) {
        setShown(myElement);
        setSettled(true);
        return;
      }
      step += 1;
      setShown(ELEMENT_KEYS[step % ELEMENT_KEYS.length]);
      delay = Math.min(300, delay * 1.13); // 점점 느려지다 멎는다
      timer = setTimeout(tick, delay);
    };
    timer = setTimeout(tick, delay);
    return () => clearTimeout(timer);
  }, [myElement]);

  const enter = async () => {
    if (!myElement) return;
    setBusy(true);
    setError(null);
    try {
      await create(myElement, saju?.name ?? null);
      nav.push("/my-room");
    } catch (e) {
      setError(e instanceof Error ? e.message : "잠시 후 다시 시도해 주세요.");
      setBusy(false);
    }
  };

  if (loading || !ready || !saju || hasRoom) return <RoomSkeletonScreen />;

  const meta = settled ? ELEMENTS[shown] : null;

  return (
    <section className="screen">
      <TopBar back home menu />
      <div className="scroll">
        <div className="intro">
          <div className={`intro-stage ${settled ? "settled" : "spinning"}`} data-element={shown}>
            <div className="intro-halo" aria-hidden />
            {ELEMENT_KEYS.map((key) => (
              <ElementCharacter
                key={key}
                element={key}
                markup={characterMarkups[key]}
                interactive={settled && key === shown}
                className={`intro-char ${key === shown ? "on" : ""}`}
                label={`${ELEMENTS[key].ohaeng} 캐릭터 ${ELEMENTS[key].name} 쓰다듬기`}
              />
            ))}
          </div>

          {meta ? (
            <>
              <p className="intro-eyebrow">{saju.name}님의 캐릭터</p>
              <h1 className="intro-name">
                {meta.ohaeng}({meta.hanja}) <b>{meta.name}</b>
              </h1>
              <p className="intro-trait">{meta.trait}</p>

              <div className="intro-note">
                <p>
                  사주 여덟 글자 가운데 <b>일간</b>, 태어난 날의 천간이 곧 나 자신을
                  뜻해요. {saju.name}님의 일간이 {meta.ohaeng}({meta.hanja})이라
                  <b> {meta.name}</b>가 방에 살게 됐어요.
                </p>
                <ul>
                  <li>오늘의 운세를 볼 때마다 하루 한 번 포인트가 들어와요</li>
                  <li>모은 포인트로 벽지·바닥·가구를 바꿔 방을 꾸며요</li>
                  <li>링크를 보내면 친구가 놀러 와 방명록을 남겨요</li>
                </ul>
              </div>

              {error && <p className="room-err">{error}</p>}

              <button
                className="btn primary block focusable intro-go"
                onClick={enter}
                disabled={busy}
              >
                {busy ? "방을 여는 중…" : `지금 ${meta.name} 만나러 가기`}
              </button>
            </>
          ) : (
            <>
              <p className="intro-eyebrow">잠깐만요</p>
              <h1 className="intro-name">사주를 읽어 캐릭터를 빚는 중…</h1>
              <p className="intro-trait">태어난 날의 기운에서 하나가 정해져요</p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
