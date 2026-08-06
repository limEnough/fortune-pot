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
    version: "0.5.0",
    date: "2026-08-06",
    title: "새 소식을 놓치지 마세요",
    items: [
      { tag: "new", text: "헤더에 확성기 버튼이 생겼어요. 업데이트가 있으면 여기서 알려드릴게요!" },
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
