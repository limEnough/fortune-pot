import TopBar from "./TopBar";

/*
 * 로딩 스켈레톤.
 *
 * 전체 화면 스피너는 "뭔가 돌고 있다"만 알려주고 도착할 화면에 대한 정보는 0인데,
 * 두 화면 모두 프리렌더된 정적 페이지라 껍데기(헤더·여백)는 즉시 그릴 수 있다.
 * 그래서 실제 콘텐츠와 같은 클래스를 그대로 쓰고 안쪽만 회색 블록으로 채운다 —
 * 카드 테두리·간격이 실물과 어긋나지 않아 내용이 들어올 때 레이아웃이 안 튄다.
 *
 * *Screen 컴포넌트는 두 군데서 쓴다. 라우트 전환 중에는 loading.tsx 가,
 * 도착 후 하이드레이션·만세력 로딩 중에는 페이지 자신이 렌더한다. 둘이 같은
 * 마크업이어야 넘어가는 순간에 화면이 튀지 않는다.
 */

/** 회색 블록 하나. w/h 는 CSS 길이 문자열 또는 숫자(px). */
function Sk({
  w,
  h,
  r,
  style,
}: {
  w?: number | string;
  h?: number | string;
  r?: number;
  style?: React.CSSProperties;
}) {
  return (
    <span
      className="sk"
      style={{ width: w, height: h, borderRadius: r, ...style }}
    />
  );
}

export function FortuneSkeleton() {
  return (
    <div
      className="fortune"
      role="status"
      aria-label="오늘의 운세를 준비하는 중"
    >
      <Sk w={130} h={13} style={{ margin: "0 auto" }} />

      <div className="f-hero">
        <div className="clay">
          <Sk w="100%" h={120} r={22} style={{ minWidth: 92 }} />
        </div>
        <div className="f-hero-body">
          <Sk w="58%" h={19} />
          <Sk h={124} r={22} />
        </div>
      </div>

      {[0, 1, 2, 3].map((i) => (
        <div className="cat" key={i}>
          <Sk w={40} h={40} r={12} style={{ flex: "0 0 auto" }} />
          <div className="body">
            <Sk w="40%" h={13} />
            <Sk w="82%" h={11} style={{ marginTop: 8 }} />
          </div>
        </div>
      ))}

      <div className="lucky">
        {[0, 1, 2].map((i) => (
          <div className="box" key={i}>
            <Sk w="62%" h={10} style={{ margin: "0 auto 8px" }} />
            <Sk w="80%" h={16} style={{ margin: "0 auto" }} />
          </div>
        ))}
      </div>

      <div className="advice">
        <Sk w={92} h={13} />
        <Sk w="100%" h={11} style={{ marginTop: 10 }} />
        <Sk w="76%" h={11} style={{ marginTop: 7 }} />
      </div>
    </div>
  );
}

export function SajuSkeleton() {
  return (
    <div className="saju" role="status" aria-label="사주 정보를 불러오는 중">
      <div className="saju-hero">
        <div className="clay">
          <Sk w="100%" h={104} r={22} style={{ minWidth: 84 }} />
        </div>
        <div className="saju-head">
          <Sk w="62%" h={22} />
          <Sk w="88%" h={12} style={{ marginTop: 9 }} />
        </div>
      </div>

      <Sk w={150} h={15} />
      <div className="ganji">
        {[0, 1, 2, 3].map((i) => (
          <div className="pillar" key={i}>
            <Sk w="52%" h={11} style={{ margin: "0 auto 7px" }} />
            <Sk h={78} r={13} style={{ marginBottom: 7 }} />
            <Sk h={78} r={13} />
          </div>
        ))}
      </div>

      <Sk w={128} h={15} />
      <div className="oh-list">
        {[0, 1, 2, 3, 4].map((i) => (
          <div className="oh-row" key={i}>
            <Sk w={30} h={13} style={{ flex: "0 0 auto" }} />
            <Sk h={10} r={99} style={{ flex: 1 }} />
            <Sk w={16} h={12} style={{ flex: "0 0 auto" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function FortuneSkeletonScreen() {
  return (
    <section className="screen">
      <TopBar home menu />
      <div className="scroll">
        <FortuneSkeleton />
      </div>
    </section>
  );
}

export function SajuSkeletonScreen() {
  return (
    <section className="screen">
      <TopBar back home menu />
      <div className="scroll">
        <SajuSkeleton />
      </div>
    </section>
  );
}
