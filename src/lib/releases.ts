/**
 * 앱 안에서 보여주는 릴리즈 노트.
 * 저장소 이력(CHANGELOG.md)과 달리 **사용자 눈높이 문장**만 담습니다.
 * 새 버전을 추가할 땐 배열 맨 앞에 넣어 주세요(최신순).
 */

export type ReleaseTag = "new" | "improve" | "fix";

export interface ReleaseNote {
  /** SemVer. CHANGELOG.md · git 태그와 동일하게 유지 */
  version: string;
  /** YYYY-MM-DD */
  date: string;
  title: string;
  items: { tag: ReleaseTag; text: string }[];
}

export const TAG_LABEL: Record<ReleaseTag, string> = {
  new: "신규",
  improve: "개선",
  fix: "수정",
};

export const RELEASES: ReleaseNote[] = [
  {
    version: "0.6.1",
    date: "2026-08-07",
    title: "글꼴이 제자리로",
    items: [
      { tag: "fix", text: "글꼴이 의도한 모양으로 보이지 않던 문제를 고쳤어요." },
    ],
  },
  {
    version: "0.6.0",
    date: "2026-08-07",
    title: "보고 싶은 것부터, 더 빠르게",
    items: [
      { tag: "new", text: "시작할 때 '오늘의 운세'와 '나의 사주' 중 먼저 볼 것을 고를 수 있어요. 입력하는 내용은 그대로예요." },
      { tag: "new", text: "'나의 사주는'에서 오늘의 운세로 바로 넘어갈 수 있어요." },
      { tag: "improve", text: "앱이 눈에 띄게 빨라졌어요. 운세를 열 때 받는 데이터를 절반 가까이 줄였어요." },
      { tag: "improve", text: "화면을 넘길 때 빈 화면 대신 들어올 내용의 윤곽이 먼저 보여요. 기다리는 시간도 줄었고요." },
      { tag: "improve", text: "시작 화면의 버튼과 문구를 다듬고, 스크롤 막대도 앱 분위기에 맞게 바꿨어요." },
    ],
  },
  {
    version: "0.5.0",
    date: "2026-08-06",
    title: "더 또렷해진 포춘팟",
    items: [
      { tag: "new", text: "업데이트 소식이 생겼어요. 새로워진 내용이 있으면 확성기로 알려드릴게요!" },
      { tag: "improve", text: "마법사 캐릭터를 새로 그렸어요. 앱 아이콘도 생겨서 홈 화면에 추가하면 더 예뻐요." },
      { tag: "improve", text: "메뉴에서 '오늘의 운세'와 '나의 사주는'을 오갈 수 있게 됐어요." },
      { tag: "improve", text: "화면을 넘길 때 로딩 표시가 떠요. 잘 넘어가고 있는지 바로 알 수 있어요." },
    ],
  },
  {
    version: "0.4.0",
    date: "2026-08-05",
    title: "매일 더 다채로운 운세",
    items: [
      { tag: "improve", text: "일일 운세 산식을 개편했어요. 같은 사주라도 날마다 결과가 더 다양하게 나옵니다." },
    ],
  },
  {
    version: "0.3.0",
    date: "2026-06-26",
    title: "사주 풀이가 더 깊어졌어요",
    items: [
      { tag: "new", text: "오행·십성 해설을 대폭 보강했어요. '나의 사주는'에서 확인해 보세요." },
      { tag: "improve", text: "운세 화면 상단 칩을 누르면 내 사주 정보를 바로 확인하고 수정할 수 있어요." },
      { tag: "fix", text: "아이폰 Safari에서 생년월일 입력칸이 삐뚤어 보이던 문제를 고쳤어요." },
    ],
  },
  {
    version: "0.2.0",
    date: "2026-06-19",
    title: "만세력으로 더 정확하게",
    items: [
      { tag: "improve", text: "만세력을 적용해 입춘·절입 시각과 밤 11시 자시 경계를 정확히 반영합니다." },
      { tag: "improve", text: "진태양시 보정을 적용해 태어난 시각을 더 정밀하게 계산해요." },
      { tag: "improve", text: "운세를 이름이 아닌 내 사주를 기준으로 생성하도록 바꿨어요." },
    ],
  },
  {
    version: "0.1.0",
    date: "2026-06-18",
    title: "포춘팟이 문을 열었어요",
    items: [
      { tag: "new", text: "사주 정보를 입력하면 오늘의 운세를 볼 수 있어요." },
      { tag: "new", text: "'나의 사주는'에서 명식·오행·십성을 확인할 수 있어요." },
    ],
  },
];

export const LATEST_VERSION = RELEASES[0].version;
