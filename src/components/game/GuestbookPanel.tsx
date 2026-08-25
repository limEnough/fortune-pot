"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNav } from "@/hooks/useNav";
import { useSaju } from "@/hooks/useSaju";
import { apiDelete, apiGet, apiPost } from "@/lib/http";
import { elementOfIlgan, type ElementKey } from "@/lib/game/elements";
import {
  forgetEntry,
  myEntryIds,
  rememberEntry,
  wroteToday,
} from "@/lib/game/guestbookLocal";
import type { GuestEntry } from "@/lib/game/types";
import { computeSaju, loadManse } from "@/lib/saju/calc";
import type { SajuInput } from "@/types/saju";
import { visitorId } from "@/lib/visitor";
import { ownerHeaders, useRoomStore } from "@/store/useRoomStore";

/*
 * 방명록 — 방 오른쪽 위 쪽지 버튼으로 여닫는 채팅창.
 *
 * 방 아래에 목록으로 길게 늘어놓지 않는다. 방은 보러 오는 곳이고 방명록은 말을
 * 거는 곳이라, 늘 펼쳐 두면 방이 목록의 머리말처럼 작아진다. 접어 두고 개수만
 * 뱃지로 알리면 방이 주인공으로 남는다.
 *
 * 채팅 모양인 이유도 같다. 남긴 사람이 여럿이고 시간 순서가 의미 있는 글이라
 * 카드 목록보다 말풍선이 읽기 쉽다. 그래서 **오래된 글이 위, 새 글이 아래**이고
 * 열면 맨 아래로 내려가 있다.
 *
 * "내가 쓴 글" 은 브라우저가 적어둔 id 로 가린다(`guestbookLocal.ts`).
 * 공유된 방은 서버에서 그려지는데 그때는 이 브라우저가 누구인지 알 수 없어서,
 * 서버가 표시해 줄 방법이 없다.
 *
 * **읽기는 누구나, 쓰기는 사주를 넣은 사람만.** 방명록 한 줄에는 남긴 사람의
 * 오행 색이 함께 붙는데, 사주가 없으면 그 색이 없어 누가 다녀갔는지가 이름
 * 한 줄로만 남는다. 링크를 주운 사람이 아무 이름이나 적고 지나가는 것도 막힌다.
 */

interface Props {
  publicId: string;
  ownerName: string;
  /** 서버가 미리 그려 보낸 목록. 없으면 처음 열 때 받아온다 */
  initial?: GuestEntry[];
}

const MAX_NICK = 12;
const MAX_MESSAGE = 200;

function whenText(at: number): string {
  const min = Math.floor((Date.now() - at) / 60000);
  if (min < 1) return "방금";
  if (min < 60) return `${min}분 전`;
  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour}시간 전`;
  const day = Math.floor(hour / 24);
  if (day < 7) return `${day}일 전`;
  return new Date(at).toLocaleDateString("ko-KR", { month: "long", day: "numeric" });
}

/**
 * 남긴 사람의 오행 — 보낼 때만 계산한다.
 *
 * 훅(useManse)으로 두면 방을 구경만 하는 사람의 브라우저까지 만세력 청크
 * 100KB 를 받는다. 공유 링크는 대부분 구경으로 끝나므로, 실제로 글을 보내는
 * 순간에만 받아온다.
 */
async function elementOf(saju: SajuInput | null): Promise<ElementKey | null> {
  if (!saju) return null;
  await loadManse();
  return elementOfIlgan(computeSaju(saju.birth, saju.hourIdx).ilgan);
}

const Note = () => (
  <svg
    width="19"
    height="19"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M4 5.5h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1z" />
    <path d="M3.4 6.2 12 12.5l8.6-6.3" />
  </svg>
);

const X = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export default function GuestbookPanel({ publicId, ownerName, initial }: Props) {
  const nav = useNav();
  const { saju, loading: sajuLoading } = useSaju();
  const myRoomId = useRoomStore((s) => s.id);
  const myToken = useRoomStore((s) => s.token);

  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<GuestEntry[] | null>(initial ?? null);
  const [mine, setMine] = useState<string[]>([]);
  const [locked, setLocked] = useState(false);
  const [nickname, setNickname] = useState("");
  const [filled, setFilled] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /*
   * "3분 전" 은 지금 시각을 봐야 알 수 있다. 서버가 그린 값과 브라우저가 그린 값이
   * 어긋나면 하이드레이션 경고가 뜨므로, 시각은 붙은 뒤에만 적는다.
   */
  const [mounted, setMounted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isOwner = myRoomId === publicId;

  useEffect(() => {
    setMounted(true);
    setMine(myEntryIds(publicId));
    setLocked(wroteToday(publicId));
  }, [publicId]);

  // 저장된 이름이 있으면 한 번만 채운다(SajuForm 과 같은 방식 — 지운 이름이 되살아나지 않게)
  useEffect(() => {
    if (filled || !saju?.name) return;
    setNickname(saju.name);
    setFilled(true);
  }, [saju, filled]);

  const load = useCallback(async () => {
    try {
      const got = await apiGet<{ entries: GuestEntry[] }>(
        `/api/game/room/${publicId}/guestbook`,
        "방명록을 불러오지 못했어요.",
      );
      setEntries(got.entries);
    } catch (e) {
      setError(e instanceof Error ? e.message : "방명록을 불러오지 못했어요.");
    }
  }, [publicId]);

  // 내 방 화면은 목록을 미리 받지 않는다 — 열지 않으면 굳이 부를 이유가 없다
  useEffect(() => {
    if (open && entries === null) void load();
  }, [open, entries, load]);

  /*
   * 채팅창이므로 늘 맨 아래(가장 새 글)에서 시작한다.
   * 한 프레임 기다리는 건 방금 그려진 말풍선의 높이가 아직 잡히지 않아서다 —
   * 바로 내리면 옛 높이 기준으로 내려가 마지막 줄이 잘린다.
   */
  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
    return () => cancelAnimationFrame(frame);
  }, [open, entries]);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const got = await apiPost<{ entry: GuestEntry }>(
        `/api/game/room/${publicId}/guestbook`,
        { nickname, message, element: await elementOf(saju), visitor: visitorId() },
        "글을 남기지 못했어요.",
      );
      setEntries((list) => [...(list ?? []), got.entry]);
      rememberEntry(publicId, got.entry.id);
      setMine((ids) => [...ids, got.entry.id]);
      setMessage("");
      setLocked(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "글을 남기지 못했어요.");
      // 서버가 하루 자물쇠로 막았다면 화면도 그 상태로 맞춘다
      if (e instanceof Error && /오늘은 이미/.test(e.message)) setLocked(true);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (entry: GuestEntry) => {
    if (!window.confirm("이 글을 지울까요?")) return;
    // 서버를 다시 부르는 대신 화면에서 먼저 지운다 — 목록이 길어도 끊기지 않게
    setEntries((list) => (list ?? []).filter((e) => e.id !== entry.id));
    try {
      await apiDelete(
        `/api/game/room/${publicId}/guestbook?entry=${entry.id}&visitor=${visitorId() ?? ""}`,
        { headers: ownerHeaders(myToken) },
      );
      forgetEntry(publicId, entry.id);
      setMine((ids) => ids.filter((x) => x !== entry.id));
    } catch (e) {
      // 지워진 척하지 않는다 — 되돌려 놓고 이유를 말한다
      await load();
      setError(e instanceof Error ? e.message : "글을 지우지 못했어요.");
    }
  };

  const count = entries?.length ?? initial?.length ?? 0;
  const canSend = !busy && !locked && !!nickname.trim() && !!message.trim();

  return (
    <div className="gb-wrap">
      <button
        className={`gb-toggle focusable ${open ? "on" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "방명록 닫기" : `방명록 열기 (${count}개)`}
      >
        <Note />
        {count > 0 && <span className="n">{count > 99 ? "99+" : count}</span>}
      </button>

      {open && (
        <div className="gb-panel" role="dialog" aria-label={`${ownerName}님의 방명록`}>
          <div className="gb-top">
            <b>방명록</b>
            <span className="c">{count}개</span>
            <button className="gb-x focusable" onClick={() => setOpen(false)} aria-label="닫기">
              <X />
            </button>
          </div>

          <div className="gb-scroll" ref={scrollRef}>
            {entries === null ? (
              <p className="gb-none">불러오는 중…</p>
            ) : entries.length === 0 ? (
              <p className="gb-none">
                아직 아무도 다녀가지 않았어요.
                <br />첫 인사를 남겨보세요.
              </p>
            ) : (
              entries.map((e) => {
                const isMine = mine.includes(e.id);
                return (
                  <div
                    key={e.id}
                    className={`gb-msg ${isMine ? "mine" : ""}`}
                    data-element={e.element ?? undefined}
                  >
                    <span className="gb-who">
                      <i className="dot" aria-hidden />
                      {isMine ? "나" : e.nickname}
                    </span>
                    <p className="gb-bubble">{e.message}</p>
                    <span className="gb-meta">
                      {mounted ? whenText(e.at) : ""}
                      {(isOwner || isMine) && (
                        <button className="gb-del focusable" onClick={() => remove(e)}>
                          지우기
                        </button>
                      )}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {error && <p className="gb-err">{error}</p>}

          {/*
            읽기는 누구나, 쓰기는 사주를 넣은 사람만. 하이드레이션 전에는 사주가
            있는지 알 수 없으므로 아무것도 세우지 않는다 — 잠깐 떴다 바뀌는 안내가
            더 어수선하다.
          */}
          {sajuLoading ? null : !saju ? (
            <div className="gb-need">
              <p>
                방명록은 <b>내 사주</b>가 있어야 남길 수 있어요.
                <br />
                생년월일을 넣으면 내 오행 색으로 인사가 남아요.
              </p>
              <button
                className="gb-send"
                onClick={() => nav.push(`/infoinput?next=visit&room=${publicId}`)}
              >
                생년월일 넣고 인사하기
              </button>
            </div>
          ) : locked ? (
            <p className="gb-done">
              오늘은 이미 남겼어요. 내일 또 들러주세요 🌙
            </p>
          ) : (
            <div className="gb-compose">
              <input
                className="gb-name"
                value={nickname}
                maxLength={MAX_NICK}
                placeholder="이름"
                aria-label="이름"
                onChange={(e) => setNickname(e.target.value)}
              />
              <input
                className="gb-text"
                value={message}
                maxLength={MAX_MESSAGE}
                placeholder={`${ownerName}님에게 한 마디`}
                aria-label="남길 말"
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && canSend) submit();
                }}
              />
              <button className="gb-send focusable" disabled={!canSend} onClick={submit}>
                {busy ? "…" : "남기기"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
