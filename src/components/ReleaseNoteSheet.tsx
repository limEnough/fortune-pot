"use client";
import { RELEASES, TAG_LABEL, LATEST_VERSION } from "@/lib/releases";
import { useRelease } from "@/hooks/useRelease";

const X = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
  >
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

const fmt = (iso: string) => {
  const [y, m, d] = iso.split("-");
  return `${y}.${m}.${d}`;
};

/** 헤더 확성기 버튼으로 여는 릴리즈 노트 바텀시트 */
export default function ReleaseNoteSheet() {
  const { noteOpen, closeNote } = useRelease();

  return (
    <>
      <div
        className={`sheet-scrim ${noteOpen ? "show" : ""}`}
        onClick={closeNote}
      />
      <div
        className={`sheet release-sheet ${noteOpen ? "show" : ""}`}
        role="dialog"
        aria-label="업데이트 소식"
        aria-modal="true"
      >
        <div className="grip" />
        <button
          className="sheet-x focusable"
          aria-label="닫기"
          onClick={closeNote}
        >
          <X />
        </button>

        <h3>업데이트 소식</h3>
        <p>포춘팟이 이렇게 달라졌어요</p>

        <div className="release-list">
          {RELEASES.map((r) => (
            <section key={r.version} className="release">
              <div className="r-head">
                <span className="r-ver">v{r.version}</span>
                {r.version === LATEST_VERSION && (
                  <span className="r-new">NEW</span>
                )}
                <span className="r-date">{fmt(r.date)}</span>
              </div>
              <h4 className="r-title">{r.title}</h4>
              <ul className="r-items">
                {r.items.map((it, i) => (
                  <li key={i}>
                    <span className={`r-tag ${it.tag}`}>
                      {TAG_LABEL[it.tag]}
                    </span>
                    <span>{it.text}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
