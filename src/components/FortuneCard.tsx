import { stars, type Fortune } from "@/lib/saju/fortune";
import ClayChar from "./ClayChar";
import SaveCardButton from "./SaveCardButton";
import { drawFortuneCard } from "@/lib/share/fortuneCard";

export default function FortuneCard({ fortune, name }: { fortune: Fortune; name: string }) {
  return (
    <div className="fortune">
      <div className="f-date">{fortune.dateLabel}</div>

      <div className="f-hero">
        <ClayChar size="sm" variant={fortune.moodKey} />
        <div className="f-hero-body">
          <div className="f-name"><b>{name}</b>님의 오늘</div>
          <div className="score-card">
            <div className="stars">{stars(fortune.score)}</div>
            <div className="big">{fortune.grade}</div>
            <div className="ln">{fortune.overall}</div>
          </div>
        </div>
      </div>

      {fortune.categories.map((c) => (
        <div className="cat" key={c.key}>
          <div className="ic">{c.icon}</div>
          <div className="body">
            <div className="k">{c.key}<span className="st">{stars(c.score)}</span></div>
            <div className="v">{c.line}</div>
          </div>
        </div>
      ))}

      <div className="lucky">
        <div className="box"><div className="t">행운의 색</div><div className="b"><span className="swatch" style={{ background: fortune.color[1] }} />{fortune.color[0]}</div></div>
        <div className="box"><div className="t">행운의 숫자</div><div className="b">{fortune.number}</div></div>
        <div className="box"><div className="t">행운의 아이템</div><div className="b" style={{ fontSize: 14 }}>{fortune.item}</div></div>
      </div>

      <div className="advice"><div className="lab">오늘의 한마디</div><p>{fortune.advice}</p></div>

      <SaveCardButton
        label="오늘의 부적 카드 저장"
        title="오늘의 부적"
        hint={`${fortune.dateLabel} · 오늘 하루치 운세를 부적 한 장에 담았어요`}
        filename={`포춘팟_부적_${name}_${fortune.dateLabel.slice(0, 10)}.png`}
        render={() => drawFortuneCard(fortune, name)}
      />
    </div>
  );
}
