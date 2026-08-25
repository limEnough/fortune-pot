"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSaju } from "@/hooks/useSaju";
import { useNav } from "@/hooks/useNav";
import { useGuestStore } from "@/store/useGuestStore";
import { useSessionStore } from "@/store/useSessionStore";
import HourPicker from "@/components/HourPicker";
import type { Gender } from "@/types/saju";

/*
 * 같은 폼이지만 들어온 이유가 둘이라, 버튼이 하는 일과 화면 문구가 다르다.
 *
 *   start(/infoinput) — 운세·사주를 보러 가는 길목. 저장하고 고른 화면으로 간다.
 *   edit(/info)       — 메뉴에서 내 정보를 고치러 온 것. 저장하고 있던 자리로 돌아간다.
 *
 * 예전엔 한 라우트(/onboarding)가 둘을 겸했다. 그래서 정보를 고치러 들어와도
 * "최근 조회한 ◯◯님으로 오늘의 운세를 확인해보시겠어요?" 가 맨 위에 떴다.
 * 고치러 온 사람에게 고치지 말라고 권하는 셈이었다.
 */
export type FormMode = "start" | "edit";

export default function SajuForm({ mode = "start" }: { mode?: FormMode }) {
  const nav = useNav();
  const searchParams = useSearchParams();
  const { saju, save } = useSaju();
  const clearGuest = useGuestStore((s) => s.clear);
  // 여기까지 와서 정보를 확정한 사람에게 메인에서 또 물을 이유가 없다
  const { confirm, reset: resetSession } = useSessionStore();

  const [name, setName] = useState("");
  const [birth, setBirth] = useState("1996-06-16");
  /*
   * number(실제로 고른 시간) · null('모르겠어요'를 직접 고름) ·
   * undefined(아직 아무것도 안 골랐다) — HourPicker 와 같은 세 상태.
   * 아래 fill-effect 가 saju.hourIdx 로 채우기 전까지는 빈 채다.
   */
  const [hourIdx, setHourIdx] = useState<number | null | undefined>(undefined);
  const [gender, setGender] = useState<Gender>("여");
  const [busy, setBusy] = useState(false);
  const [bubbleDismissed, setBubbleDismissed] = useState(false);
  const [filled, setFilled] = useState(false);

  /*
   * 저장된 값이 있으면 폼을 그 값으로 채운다.
   *
   * 예전엔 늘 기본값으로 시작하고 재사용은 말풍선으로만 제안했다. 그런데 이제
   * 귀인지도에서 이름·생일·시간까지 받고 오는 길이 생겼다. 그 사람에게 필요한 건
   * **성별 한 칸**이지 처음부터 다시 넣는 일이 아니다.
   * 하이드레이션 뒤에 한 번만 채우고, 이후 타이핑은 덮어쓰지 않는다.
   */
  useEffect(() => {
    if (filled || !saju) return;
    setName(saju.name);
    setBirth(saju.birth);
    setHourIdx(saju.hourIdx);
    if (saju.gender) setGender(saju.gender);
    setFilled(true);
  }, [saju, filled]);

  /*
   * 지도만 하고 온 사람 — 이름·생일은 찼고 성별이 비어 있다.
   * 태어난 시긴까지 '모르겠어요'로 넘어왔다면 여기서 한 번 더 묻는다. 사주
   * 풀이는 시주가 있고 없고가 크게 다르므로, 그냥 넘기지 않고 고를 기회를
   * 준다 — 그래도 모르면 '모르겠어요' 그대로 두면 된다.
   */
  const fromMap = !!saju && saju.gender === null;
  const needHour = fromMap && saju.hourIdx === null;

  const editing = mode === "edit";

  /*
   * start: 홈에서 고른 도착지(?next=saju|fortune|room|visit) — 없으면 오늘의 운세로.
   * edit:  고치기 전에 있던 화면(?from=) — 없으면 홈으로.
   *
   * 도착지를 목록으로 둔 건 `?next=` 가 주소창으로 들어오는 값이라서다. 그대로
   * 이어 붙이면 남이 보낸 링크가 이 폼을 아무 데로나 튕기는 통로가 된다.
   */
  const NEXT = {
    // josa: 받침에 따라 갈리는 목적격 조사. 말이 어긋나는 자리라 값과 같이 둔다
    saju: { path: "/saju", label: "사주 풀이", josa: "를" },
    fortune: { path: "/fortune", label: "오늘의 운세", josa: "를" },
    // 방이 없는 사람이 오는 길이라 캐릭터를 빚는 화면부터 — 이미 있으면 저기서 방으로 넘긴다
    room: { path: "/my-room/intro", label: "내 캐릭터", josa: "를" },
    // 남의 방에서 방명록을 남기려다 온 사람 — 보던 방으로 돌려보낸다
    visit: { path: "", label: "방명록", josa: "을" },
  } as const;
  const next = NEXT[searchParams.get("next") as keyof typeof NEXT] ?? NEXT.fortune;

  /*
   * 남의 방으로 돌아가는 길만 값을 받아 만든다. 그래도 주소를 그대로 잇지는 않는다 —
   * 방 id 는 정해진 32글자로만 이뤄지므로, 그 모양이 아니면 홈으로 보낸다.
   * (`lib/game/store.ts` 의 randomId 가 쓰는 알파벳)
   */
  const roomId = searchParams.get("room") ?? "";
  const visitPath = /^[a-z2-9]{6,16}$/.test(roomId) ? `/room/${roomId}` : "/";
  const dest = editing
    ? searchParams.get("from") || "/"
    : next.path || visitPath;
  const destLabel = next.label;

  /*
   * 말풍선은 start 에서만. 고치러 온 사람에게 "그냥 그대로 보시겠어요?" 는
   * 하려던 일을 막는 제안이다. 빠진 칸을 채우러 온 사람에게도 띄우지 않는다.
   */
  const showRecentBubble = !editing && !!saju && !fromMap && !bubbleDismissed;

  const useRecent = () => {
    confirm();
    nav.push(dest);
  };
  const dropRecent = () => {
    clearGuest();
    resetSession();
    setBubbleDismissed(true);
  };

  const submit = async () => {
    // 제출 직후 save()가 store를 갱신해 말풍선 조건이 재활성화되는 깜빡임 방지
    setBubbleDismissed(true);
    // 저장 → 전환 사이는 버튼의 '분석 중…' 상태가 덮는다.
    // 도착 화면은 자기 스켈레톤을 띄우므로 여기서 전역 로딩을 켤 필요가 없다.
    setBusy(true);
    try {
      await save({
        name: name.trim() || "게스트",
        birth,
        // 고르지 않은 채 제출했다면 '모르겠어요'와 같은 null 로 저장한다
        hourIdx: hourIdx ?? null,
        gender,
      });
      // 방금 손으로 확정한 정보다. 메인에서 또 물을 이유가 없다
      confirm();
      // start 는 고른 화면으로, edit 는 고치기 전에 있던 자리로
      if (editing) nav.replace(dest);
      else nav.push(dest);
    } catch (e) {
      alert("저장에 실패했어요. 잠시 후 다시 시도해 주세요.");
      setBusy(false);
    }
  };

  return (
    <div className="form">
      {showRecentBubble && saju && (
        <div
          className="recent-bubble"
          role="dialog"
          aria-label="최근 조회 사주 재사용"
        >
          <p>
            최근 조회한 <b style={{ color: "var(--magic)" }}>{saju.name}</b>
            님으로
            {destLabel}
            {next.josa} 확인해보시겠어요?
          </p>
          <div className="bubble-actions">
            <button
              type="button"
              className="bubble-btn ghost focusable"
              onClick={dropRecent}
            >
              아니요
            </button>
            <button
              type="button"
              className="bubble-btn primary focusable"
              onClick={useRecent}
            >
              네
            </button>
          </div>
        </div>
      )}

      <div className="form-head">
        <h2>{editing ? "내 정보 수정" : "사주 정보 입력"}</h2>
        <span>
          {fromMap
            ? needHour
              ? "귀인지도에 넣은 정보를 가져왔어요. 성별과 태어난 시간만 확인해 주세요"
              : "귀인지도에 넣은 정보를 가져왔어요. 성별만 골라주세요"
            : editing
              ? "고칠 곳을 바꾸고 저장하면 다음 조회부터 새 정보로 봐요"
              : "정확한 풀이를 위해 태어난 순간을 알려주세요"}
        </span>
      </div>

      <label className="field">
        <span className="lab">이름</span>
        <input
          className="input focusable"
          value={name}
          placeholder="이름을 입력하세요"
          onChange={(e) => setName(e.target.value)}
        />
      </label>

      <label className="field">
        <span className="lab">생년월일</span>
        <input
          className="input focusable"
          type="date"
          value={birth}
          onChange={(e) => setBirth(e.target.value)}
        />
      </label>

      <div className="field">
        <span className="lab">
          태어난 시간
          {needHour && <em className="need">확인 필요</em>}
        </span>
        <HourPicker
          value={hourIdx}
          onChange={setHourIdx}
          hint="몰라도 괜찮아요 · 시간을 넣으면 풀이가 조금 더 정확해져요"
        />
      </div>

      <label className="field">
        <span className="lab">
          성별
          {fromMap && <em className="need">확인 필요</em>}
        </span>
        <div className="seg">
          <button
            type="button"
            className={`focusable ${gender === "여" ? "on" : ""}`}
            onClick={() => setGender("여")}
          >
            여성
          </button>
          <button
            type="button"
            className={`focusable ${gender === "남" ? "on" : ""}`}
            onClick={() => setGender("남")}
          >
            남성
          </button>
        </div>
      </label>

      <div className="spacer" />
      <button
        className="btn primary block focusable"
        style={{ marginTop: 6 }}
        disabled={busy}
        onClick={submit}
      >
        {editing
          ? busy
            ? "저장 중…"
            : "저장하기"
          : busy
            ? "분석 중…"
            : `분석하고 ${destLabel} 보기`}
      </button>
    </div>
  );
}
