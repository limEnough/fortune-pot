/*
 * 클레이 마법사 캐릭터 5종 (오리지널 SVG).
 *
 * 루트 <svg>의 class / role / aria-label / width / height 는 ClayChar가 주입하므로
 * 여기 마크업에는 넣지 않아도 됩니다(넣어도 덮어씁니다).
 * 크기는 CSS `.char` 가 잡으니 viewBox 비율만 유지해 주세요.
 */
export const VARIANT_KEYS = [
  "base",
  "star",
  "love",
  "mischief",
  "dream",
] as const;
export type ClayVariant = (typeof VARIANT_KEYS)[number];

/** 스크린리더용 설명 — 루트 <svg>의 aria-label로 주입됩니다 */
export const CLAY_LABELS: Record<string, string> = {
  base: "클레이 마법사 캐릭터",
  star: "클레이 마법사 - 놀란 표정",
  love: "클레이 마법사 - 사랑에 빠진 표정",
  mischief: "클레이 마법사 - 장난꾸러기 표정",
  dream: "클레이 마법사 - 꿈꾸는 표정",
};

export const CLAY_VARIANTS: Record<string, string> = {
  base: `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 320" width="300" height="320">
    <defs>
      <radialGradient id="glow" cx="50%" cy="46%" r="55%">
        <stop offset="0%" stop-color="#9a6cff" stop-opacity=".8"/>
        <stop offset="55%" stop-color="#9a6cff" stop-opacity=".18"/>
        <stop offset="100%" stop-color="#9a6cff" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="skin" cx="38%" cy="30%" r="82%">
        <stop offset="0%" stop-color="#fffdf7"/><stop offset="45%" stop-color="#fff2d8"/>
        <stop offset="80%" stop-color="#ffe0b0"/><stop offset="100%" stop-color="#f0c88f"/>
      </radialGradient>
      <radialGradient id="skinShade" cx="50%" cy="88%" r="60%">
        <stop offset="0%" stop-color="#e2a866" stop-opacity=".55"/><stop offset="70%" stop-color="#e2a866" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="hat" x1="18%" y1="0%" x2="82%" y2="100%">
        <stop offset="0%" stop-color="#d3bcff"/><stop offset="48%" stop-color="#9d70ff"/><stop offset="100%" stop-color="#6a3fd0"/>
      </linearGradient>
      <linearGradient id="brim" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#a988f0"/><stop offset="100%" stop-color="#5b34ad"/>
      </linearGradient>
      <radialGradient id="orbP" cx="38%" cy="32%" r="72%"><stop offset="0%" stop-color="#fff2fb"/><stop offset="42%" stop-color="#f6a9e6"/><stop offset="100%" stop-color="#d23fb0"/></radialGradient>
      <radialGradient id="orbR" cx="38%" cy="32%" r="72%"><stop offset="0%" stop-color="#fff2f4"/><stop offset="42%" stop-color="#ff9bb4"/><stop offset="100%" stop-color="#e23f6b"/></radialGradient>
      <radialGradient id="orbG" cx="38%" cy="32%" r="72%"><stop offset="0%" stop-color="#fffdf0"/><stop offset="42%" stop-color="#ffe081"/><stop offset="100%" stop-color="#f0a92a"/></radialGradient>
      <radialGradient id="cheek" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#ff9ec4" stop-opacity=".85"/><stop offset="100%" stop-color="#ff9ec4" stop-opacity="0"/></radialGradient>
      <radialGradient id="eyestar" cx="42%" cy="38%" r="70%"><stop offset="0%" stop-color="#fff6d5"/><stop offset="45%" stop-color="#fcd34d"/><stop offset="100%" stop-color="#f0a930"/></radialGradient>
      <radialGradient id="star" cx="42%" cy="38%" r="70%"><stop offset="0%" stop-color="#fff6d5"/><stop offset="45%" stop-color="#fcd34d"/><stop offset="100%" stop-color="#f0a930"/></radialGradient>
    </defs>

    <ellipse cx="150" cy="170" rx="150" ry="150" fill="url(#glow)"/>
    <ellipse cx="150" cy="300" rx="82" ry="15" fill="#2a0f55" opacity=".33"/>

    <ellipse cx="150" cy="190" rx="110" ry="106" fill="url(#skin)"/>
    <ellipse cx="150" cy="190" rx="110" ry="106" fill="url(#skinShade)"/>
    <ellipse cx="112" cy="140" rx="52" ry="38" fill="#ffffff" opacity=".38"/>

    <ellipse cx="96" cy="212" rx="24" ry="17" fill="url(#cheek)"/>
    <ellipse cx="204" cy="212" rx="24" ry="17" fill="url(#cheek)"/>

      <ellipse cx="118" cy="188" rx="13" ry="17" fill="#3a2350"/>
      <ellipse cx="182" cy="188" rx="13" ry="17" fill="#3a2350"/>
      <circle cx="122" cy="182" r="4.6" fill="#fff"/><circle cx="186" cy="182" r="4.6" fill="#fff"/>
      <circle cx="114" cy="194" r="2.4" fill="#fff" opacity=".8"/><circle cx="178" cy="194" r="2.4" fill="#fff" opacity=".8"/>
    <path d="M140 206 q10 9 20 0" stroke="#d98a5a" stroke-width="3.4" fill="none" stroke-linecap="round"/>

    <ellipse cx="58" cy="216" rx="15" ry="12" fill="url(#skin)"/>
    <ellipse cx="242" cy="216" rx="15" ry="12" fill="url(#skin)"/>

      <circle cx="150" cy="250" r="30" fill="url(#orbP)"/>
      <circle cx="140" cy="240" r="8.5" fill="#ffffff" opacity=".85"/>
      <circle cx="160" cy="258" r="3" fill="#ffffff" opacity=".6"/>

    <g transform="rotate(-6 150 96)">
      <ellipse cx="150" cy="112" rx="96" ry="24" fill="#5b34ad"/>
      <ellipse cx="150" cy="107" rx="96" ry="23" fill="url(#brim)"/>
      <path d="M74 106 C 82 58 110 30 150 24 C 172 22 186 34 178 52 C 192 74 210 92 224 106 C 190 122 108 122 74 106 Z" fill="url(#hat)"/>
      <path d="M150 28 C 130 44 120 74 116 104 C 104 96 104 66 116 44 C 126 32 138 28 150 28 Z" fill="#ffffff" opacity=".22"/>
      <ellipse cx="150" cy="100" rx="70" ry="14" fill="#3a1f7a" opacity=".35"/>
      <path d="M176 20 l6 15 15 6 -15 6 -6 16 -6 -16 -15 -6 15 -6 z" fill="url(#star)"/>
    </g>
    <path d="M40 141 L43 147 L49 150 L43 153 L40 159 L37 153 L31 150 L37 147 Z" fill="#fcd34d" opacity=".9"/><circle cx="262" cy="150" r="5" fill="#f0abfc"/><circle cx="250" cy="120" r="3" fill="#fff" opacity=".8"/>
  </svg>`,
  star: `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 320" width="300" height="320">
    <defs>
      <radialGradient id="glow" cx="50%" cy="46%" r="55%">
        <stop offset="0%" stop-color="#b98bff" stop-opacity=".8"/>
        <stop offset="55%" stop-color="#b98bff" stop-opacity=".18"/>
        <stop offset="100%" stop-color="#b98bff" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="skin" cx="38%" cy="30%" r="82%">
        <stop offset="0%" stop-color="#fffdf7"/><stop offset="45%" stop-color="#fff2d8"/>
        <stop offset="80%" stop-color="#ffe0b0"/><stop offset="100%" stop-color="#f0c88f"/>
      </radialGradient>
      <radialGradient id="skinShade" cx="50%" cy="88%" r="60%">
        <stop offset="0%" stop-color="#e2a866" stop-opacity=".55"/><stop offset="70%" stop-color="#e2a866" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="hat" x1="18%" y1="0%" x2="82%" y2="100%">
        <stop offset="0%" stop-color="#d3bcff"/><stop offset="48%" stop-color="#9d70ff"/><stop offset="100%" stop-color="#6a3fd0"/>
      </linearGradient>
      <linearGradient id="brim" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#a988f0"/><stop offset="100%" stop-color="#5b34ad"/>
      </linearGradient>
      <radialGradient id="orbP" cx="38%" cy="32%" r="72%"><stop offset="0%" stop-color="#fff2fb"/><stop offset="42%" stop-color="#f6a9e6"/><stop offset="100%" stop-color="#d23fb0"/></radialGradient>
      <radialGradient id="orbR" cx="38%" cy="32%" r="72%"><stop offset="0%" stop-color="#fff2f4"/><stop offset="42%" stop-color="#ff9bb4"/><stop offset="100%" stop-color="#e23f6b"/></radialGradient>
      <radialGradient id="orbG" cx="38%" cy="32%" r="72%"><stop offset="0%" stop-color="#fffdf0"/><stop offset="42%" stop-color="#ffe081"/><stop offset="100%" stop-color="#f0a92a"/></radialGradient>
      <radialGradient id="cheek" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#ff9ec4" stop-opacity=".85"/><stop offset="100%" stop-color="#ff9ec4" stop-opacity="0"/></radialGradient>
      <radialGradient id="eyestar" cx="42%" cy="38%" r="70%"><stop offset="0%" stop-color="#fff6d5"/><stop offset="45%" stop-color="#fcd34d"/><stop offset="100%" stop-color="#f0a930"/></radialGradient>
      <radialGradient id="star" cx="42%" cy="38%" r="70%"><stop offset="0%" stop-color="#fff6d5"/><stop offset="45%" stop-color="#fcd34d"/><stop offset="100%" stop-color="#f0a930"/></radialGradient>
    </defs>

    <ellipse cx="150" cy="170" rx="150" ry="150" fill="url(#glow)"/>
    <ellipse cx="150" cy="300" rx="82" ry="15" fill="#2a0f55" opacity=".33"/>

    <ellipse cx="150" cy="190" rx="110" ry="106" fill="url(#skin)"/>
    <ellipse cx="150" cy="190" rx="110" ry="106" fill="url(#skinShade)"/>
    <ellipse cx="112" cy="140" rx="52" ry="38" fill="#ffffff" opacity=".38"/>

    <ellipse cx="96" cy="212" rx="24" ry="17" fill="url(#cheek)"/>
    <ellipse cx="204" cy="212" rx="24" ry="17" fill="url(#cheek)"/>

      <ellipse cx="118" cy="188" rx="14" ry="17" fill="#3a2350"/>
      <ellipse cx="182" cy="188" rx="14" ry="17" fill="#3a2350"/>
      <path d="M118 176 L122 184 L130 188 L122 192 L118 200 L114 192 L106 188 L114 184 Z" fill="url(#eyestar)"/>
      <path d="M182 176 L186 184 L194 188 L186 192 L182 200 L178 192 L170 188 L178 184 Z" fill="url(#eyestar)"/>
      <circle cx="115" cy="185" r="2" fill="#fff"/><circle cx="179" cy="185" r="2" fill="#fff"/>
    <ellipse cx="150" cy="209" rx="7" ry="6.5" fill="#c76b8f"/><ellipse cx="148" cy="207" rx="2.4" ry="2" fill="#ffd0e2"/>

    <ellipse cx="58" cy="216" rx="15" ry="12" fill="url(#skin)"/>
    <ellipse cx="242" cy="216" rx="15" ry="12" fill="url(#skin)"/>

      <circle cx="150" cy="250" r="30" fill="url(#orbP)"/>
      <circle cx="140" cy="240" r="8.5" fill="#ffffff" opacity=".85"/>
      <circle cx="160" cy="258" r="3" fill="#ffffff" opacity=".6"/>

    <g transform="rotate(-6 150 96)">
      <ellipse cx="150" cy="112" rx="96" ry="24" fill="#5b34ad"/>
      <ellipse cx="150" cy="107" rx="96" ry="23" fill="url(#brim)"/>
      <path d="M74 106 C 82 58 110 30 150 24 C 172 22 186 34 178 52 C 192 74 210 92 224 106 C 190 122 108 122 74 106 Z" fill="url(#hat)"/>
      <path d="M150 28 C 130 44 120 74 116 104 C 104 96 104 66 116 44 C 126 32 138 28 150 28 Z" fill="#ffffff" opacity=".22"/>
      <ellipse cx="150" cy="100" rx="70" ry="14" fill="#3a1f7a" opacity=".35"/>
      <path d="M176 20 l6 15 15 6 -15 6 -6 16 -6 -16 -15 -6 15 -6 z" fill="url(#star)"/>
    </g>
    <path d="M268 111 L271 117 L277 120 L271 123 L268 129 L265 123 L259 120 L265 117 Z" fill="#fcd34d"/><path d="M36 189 L38.5 193.5 L43 196 L38.5 198.5 L36 203 L33.5 198.5 L29 196 L33.5 193.5 Z" fill="#fff6d5" opacity=".9"/>
  </svg>`,
  love: `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 320" width="300" height="320">
    <defs>
      <radialGradient id="glow" cx="50%" cy="46%" r="55%">
        <stop offset="0%" stop-color="#ff7ab8" stop-opacity=".8"/>
        <stop offset="55%" stop-color="#ff7ab8" stop-opacity=".18"/>
        <stop offset="100%" stop-color="#ff7ab8" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="skin" cx="38%" cy="30%" r="82%">
        <stop offset="0%" stop-color="#fffdf7"/><stop offset="45%" stop-color="#fff2d8"/>
        <stop offset="80%" stop-color="#ffe0b0"/><stop offset="100%" stop-color="#f0c88f"/>
      </radialGradient>
      <radialGradient id="skinShade" cx="50%" cy="88%" r="60%">
        <stop offset="0%" stop-color="#e2a866" stop-opacity=".55"/><stop offset="70%" stop-color="#e2a866" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="hat" x1="18%" y1="0%" x2="82%" y2="100%">
        <stop offset="0%" stop-color="#d3bcff"/><stop offset="48%" stop-color="#9d70ff"/><stop offset="100%" stop-color="#6a3fd0"/>
      </linearGradient>
      <linearGradient id="brim" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#a988f0"/><stop offset="100%" stop-color="#5b34ad"/>
      </linearGradient>
      <radialGradient id="orbP" cx="38%" cy="32%" r="72%"><stop offset="0%" stop-color="#fff2fb"/><stop offset="42%" stop-color="#f6a9e6"/><stop offset="100%" stop-color="#d23fb0"/></radialGradient>
      <radialGradient id="orbR" cx="38%" cy="32%" r="72%"><stop offset="0%" stop-color="#fff2f4"/><stop offset="42%" stop-color="#ff9bb4"/><stop offset="100%" stop-color="#e23f6b"/></radialGradient>
      <radialGradient id="orbG" cx="38%" cy="32%" r="72%"><stop offset="0%" stop-color="#fffdf0"/><stop offset="42%" stop-color="#ffe081"/><stop offset="100%" stop-color="#f0a92a"/></radialGradient>
      <radialGradient id="cheek" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#ff9ec4" stop-opacity=".85"/><stop offset="100%" stop-color="#ff9ec4" stop-opacity="0"/></radialGradient>
      <radialGradient id="eyestar" cx="42%" cy="38%" r="70%"><stop offset="0%" stop-color="#fff6d5"/><stop offset="45%" stop-color="#fcd34d"/><stop offset="100%" stop-color="#f0a930"/></radialGradient>
      <radialGradient id="star" cx="42%" cy="38%" r="70%"><stop offset="0%" stop-color="#fff6d5"/><stop offset="45%" stop-color="#fcd34d"/><stop offset="100%" stop-color="#f0a930"/></radialGradient>
    </defs>

    <ellipse cx="150" cy="170" rx="150" ry="150" fill="url(#glow)"/>
    <ellipse cx="150" cy="300" rx="82" ry="15" fill="#2a0f55" opacity=".33"/>

    <ellipse cx="150" cy="190" rx="110" ry="106" fill="url(#skin)"/>
    <ellipse cx="150" cy="190" rx="110" ry="106" fill="url(#skinShade)"/>
    <ellipse cx="112" cy="140" rx="52" ry="38" fill="#ffffff" opacity=".38"/>

    <ellipse cx="96" cy="212" rx="24" ry="17" fill="url(#cheek)"/>
    <ellipse cx="204" cy="212" rx="24" ry="17" fill="url(#cheek)"/>

      <path d="M118 198.5 C 103.0 186.5 106.0 176.75 118 184.7 C 130.0 176.75 133.0 186.5 118 198.5 Z" fill="#ff5a9e"/>
      <path d="M182 198.5 C 167.0 186.5 170.0 176.75 182 184.7 C 194.0 176.75 197.0 186.5 182 198.5 Z" fill="#ff5a9e"/>
      <circle cx="114" cy="184" r="3" fill="#fff" opacity=".9"/>
      <circle cx="178" cy="184" r="3" fill="#fff" opacity=".9"/>
    <path d="M140 206 q10 9 20 0" stroke="#d98a5a" stroke-width="3.4" fill="none" stroke-linecap="round"/>

    <ellipse cx="58" cy="216" rx="15" ry="12" fill="url(#skin)"/>
    <ellipse cx="242" cy="216" rx="15" ry="12" fill="url(#skin)"/>

      <circle cx="150" cy="250" r="30" fill="url(#orbR)"/>
      <circle cx="140" cy="240" r="8.5" fill="#ffffff" opacity=".85"/>
      <circle cx="160" cy="258" r="3" fill="#ffffff" opacity=".6"/>

    <g transform="rotate(-6 150 96)">
      <ellipse cx="150" cy="112" rx="96" ry="24" fill="#5b34ad"/>
      <ellipse cx="150" cy="107" rx="96" ry="23" fill="url(#brim)"/>
      <path d="M74 106 C 82 58 110 30 150 24 C 172 22 186 34 178 52 C 192 74 210 92 224 106 C 190 122 108 122 74 106 Z" fill="url(#hat)"/>
      <path d="M150 28 C 130 44 120 74 116 104 C 104 96 104 66 116 44 C 126 32 138 28 150 28 Z" fill="#ffffff" opacity=".22"/>
      <ellipse cx="150" cy="100" rx="70" ry="14" fill="#3a1f7a" opacity=".35"/>
      <path d="M176 20 l6 15 15 6 -15 6 -6 16 -6 -16 -15 -6 15 -6 z" fill="url(#star)"/>
    </g>
    <path d="M262 157.0 C 252.0 149.0 254.0 142.5 262 147.8 C 270.0 142.5 272.0 149.0 262 157.0 Z" fill="#ff8fc0"/><path d="M40 173.6 C 32.0 167.2 33.6 162.0 40 166.24 C 46.4 162.0 48.0 167.2 40 173.6 Z" fill="#ffb3d4" opacity=".9"/>
  </svg>`,
  mischief: `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 320" width="300" height="320">
    <defs>
      <radialGradient id="glow" cx="50%" cy="46%" r="55%">
        <stop offset="0%" stop-color="#9a6cff" stop-opacity=".8"/>
        <stop offset="55%" stop-color="#9a6cff" stop-opacity=".18"/>
        <stop offset="100%" stop-color="#9a6cff" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="skin" cx="38%" cy="30%" r="82%">
        <stop offset="0%" stop-color="#fffdf7"/><stop offset="45%" stop-color="#fff2d8"/>
        <stop offset="80%" stop-color="#ffe0b0"/><stop offset="100%" stop-color="#f0c88f"/>
      </radialGradient>
      <radialGradient id="skinShade" cx="50%" cy="88%" r="60%">
        <stop offset="0%" stop-color="#e2a866" stop-opacity=".55"/><stop offset="70%" stop-color="#e2a866" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="hat" x1="18%" y1="0%" x2="82%" y2="100%">
        <stop offset="0%" stop-color="#d3bcff"/><stop offset="48%" stop-color="#9d70ff"/><stop offset="100%" stop-color="#6a3fd0"/>
      </linearGradient>
      <linearGradient id="brim" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#a988f0"/><stop offset="100%" stop-color="#5b34ad"/>
      </linearGradient>
      <radialGradient id="orbP" cx="38%" cy="32%" r="72%"><stop offset="0%" stop-color="#fff2fb"/><stop offset="42%" stop-color="#f6a9e6"/><stop offset="100%" stop-color="#d23fb0"/></radialGradient>
      <radialGradient id="orbR" cx="38%" cy="32%" r="72%"><stop offset="0%" stop-color="#fff2f4"/><stop offset="42%" stop-color="#ff9bb4"/><stop offset="100%" stop-color="#e23f6b"/></radialGradient>
      <radialGradient id="orbG" cx="38%" cy="32%" r="72%"><stop offset="0%" stop-color="#fffdf0"/><stop offset="42%" stop-color="#ffe081"/><stop offset="100%" stop-color="#f0a92a"/></radialGradient>
      <radialGradient id="cheek" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#ff9ec4" stop-opacity=".85"/><stop offset="100%" stop-color="#ff9ec4" stop-opacity="0"/></radialGradient>
      <radialGradient id="eyestar" cx="42%" cy="38%" r="70%"><stop offset="0%" stop-color="#fff6d5"/><stop offset="45%" stop-color="#fcd34d"/><stop offset="100%" stop-color="#f0a930"/></radialGradient>
      <radialGradient id="star" cx="42%" cy="38%" r="70%"><stop offset="0%" stop-color="#fff6d5"/><stop offset="45%" stop-color="#fcd34d"/><stop offset="100%" stop-color="#f0a930"/></radialGradient>
    </defs>

    <ellipse cx="150" cy="170" rx="150" ry="150" fill="url(#glow)"/>
    <ellipse cx="150" cy="300" rx="82" ry="15" fill="#2a0f55" opacity=".33"/>

    <ellipse cx="150" cy="190" rx="110" ry="106" fill="url(#skin)"/>
    <ellipse cx="150" cy="190" rx="110" ry="106" fill="url(#skinShade)"/>
    <ellipse cx="112" cy="140" rx="52" ry="38" fill="#ffffff" opacity=".38"/>

    <ellipse cx="96" cy="212" rx="24" ry="17" fill="url(#cheek)"/>
    <ellipse cx="204" cy="212" rx="24" ry="17" fill="url(#cheek)"/>

      <ellipse cx="118" cy="188" rx="13" ry="17" fill="#3a2350"/>
      <circle cx="122" cy="182" r="4.6" fill="#fff"/><circle cx="114" cy="194" r="2.2" fill="#fff" opacity=".8"/>
      <path d="M169 191 Q182 176 195 191" stroke="#3a2350" stroke-width="5.5" fill="none" stroke-linecap="round"/>
    <path d="M137 205 Q150 219 163 205 Z" fill="#b8567e"/><path d="M143 210 Q150 216 157 210 Z" fill="#ff8fb3"/>

    <ellipse cx="58" cy="216" rx="15" ry="12" fill="url(#skin)"/>
    <ellipse cx="242" cy="216" rx="15" ry="12" fill="url(#skin)"/>

      <circle cx="150" cy="250" r="30" fill="url(#orbP)"/>
      <circle cx="140" cy="240" r="8.5" fill="#ffffff" opacity=".85"/>
      <circle cx="160" cy="258" r="3" fill="#ffffff" opacity=".6"/>

    <g transform="rotate(-6 150 96)">
      <ellipse cx="150" cy="112" rx="96" ry="24" fill="#5b34ad"/>
      <ellipse cx="150" cy="107" rx="96" ry="23" fill="url(#brim)"/>
      <path d="M74 106 C 82 58 110 30 150 24 C 172 22 186 34 178 52 C 192 74 210 92 224 106 C 190 122 108 122 74 106 Z" fill="url(#hat)"/>
      <path d="M150 28 C 130 44 120 74 116 104 C 104 96 104 66 116 44 C 126 32 138 28 150 28 Z" fill="#ffffff" opacity=".22"/>
      <ellipse cx="150" cy="100" rx="70" ry="14" fill="#3a1f7a" opacity=".35"/>
      <path d="M176 20 l6 15 15 6 -15 6 -6 16 -6 -16 -15 -6 15 -6 z" fill="url(#star)"/>
    </g>
    <path d="M40 141 L43 147 L49 150 L43 153 L40 159 L37 153 L31 150 L37 147 Z" fill="#fcd34d" opacity=".9"/><circle cx="262" cy="150" r="5" fill="#f0abfc"/><circle cx="250" cy="120" r="3" fill="#fff" opacity=".8"/>
  </svg>`,
  dream: `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 320" width="300" height="320">
    <defs>
      <radialGradient id="glow" cx="50%" cy="46%" r="55%">
        <stop offset="0%" stop-color="#ffd479" stop-opacity=".8"/>
        <stop offset="55%" stop-color="#ffd479" stop-opacity=".18"/>
        <stop offset="100%" stop-color="#ffd479" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="skin" cx="38%" cy="30%" r="82%">
        <stop offset="0%" stop-color="#fffdf7"/><stop offset="45%" stop-color="#fff2d8"/>
        <stop offset="80%" stop-color="#ffe0b0"/><stop offset="100%" stop-color="#f0c88f"/>
      </radialGradient>
      <radialGradient id="skinShade" cx="50%" cy="88%" r="60%">
        <stop offset="0%" stop-color="#e2a866" stop-opacity=".55"/><stop offset="70%" stop-color="#e2a866" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="hat" x1="18%" y1="0%" x2="82%" y2="100%">
        <stop offset="0%" stop-color="#d3bcff"/><stop offset="48%" stop-color="#9d70ff"/><stop offset="100%" stop-color="#6a3fd0"/>
      </linearGradient>
      <linearGradient id="brim" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#a988f0"/><stop offset="100%" stop-color="#5b34ad"/>
      </linearGradient>
      <radialGradient id="orbP" cx="38%" cy="32%" r="72%"><stop offset="0%" stop-color="#fff2fb"/><stop offset="42%" stop-color="#f6a9e6"/><stop offset="100%" stop-color="#d23fb0"/></radialGradient>
      <radialGradient id="orbR" cx="38%" cy="32%" r="72%"><stop offset="0%" stop-color="#fff2f4"/><stop offset="42%" stop-color="#ff9bb4"/><stop offset="100%" stop-color="#e23f6b"/></radialGradient>
      <radialGradient id="orbG" cx="38%" cy="32%" r="72%"><stop offset="0%" stop-color="#fffdf0"/><stop offset="42%" stop-color="#ffe081"/><stop offset="100%" stop-color="#f0a92a"/></radialGradient>
      <radialGradient id="cheek" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#ff9ec4" stop-opacity=".85"/><stop offset="100%" stop-color="#ff9ec4" stop-opacity="0"/></radialGradient>
      <radialGradient id="eyestar" cx="42%" cy="38%" r="70%"><stop offset="0%" stop-color="#fff6d5"/><stop offset="45%" stop-color="#fcd34d"/><stop offset="100%" stop-color="#f0a930"/></radialGradient>
      <radialGradient id="star" cx="42%" cy="38%" r="70%"><stop offset="0%" stop-color="#fff6d5"/><stop offset="45%" stop-color="#fcd34d"/><stop offset="100%" stop-color="#f0a930"/></radialGradient>
    </defs>

    <ellipse cx="150" cy="170" rx="150" ry="150" fill="url(#glow)"/>
    <ellipse cx="150" cy="300" rx="82" ry="15" fill="#2a0f55" opacity=".33"/>

    <ellipse cx="150" cy="190" rx="110" ry="106" fill="url(#skin)"/>
    <ellipse cx="150" cy="190" rx="110" ry="106" fill="url(#skinShade)"/>
    <ellipse cx="112" cy="140" rx="52" ry="38" fill="#ffffff" opacity=".38"/>

    <ellipse cx="96" cy="212" rx="24" ry="17" fill="url(#cheek)"/>
    <ellipse cx="204" cy="212" rx="24" ry="17" fill="url(#cheek)"/>

      <path d="M105 186 Q118 199 131 186" stroke="#3a2350" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M169 186 Q182 199 195 186" stroke="#3a2350" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M142 207 q8 6 16 0" stroke="#d98a5a" stroke-width="3.2" fill="none" stroke-linecap="round"/>

    <ellipse cx="58" cy="216" rx="15" ry="12" fill="url(#skin)"/>
    <ellipse cx="242" cy="216" rx="15" ry="12" fill="url(#skin)"/>

      <circle cx="150" cy="250" r="30" fill="url(#orbG)"/>
      <circle cx="140" cy="240" r="8.5" fill="#ffffff" opacity=".85"/>
      <circle cx="160" cy="258" r="3" fill="#ffffff" opacity=".6"/>

    <g transform="rotate(-6 150 96)">
      <ellipse cx="150" cy="112" rx="96" ry="24" fill="#5b34ad"/>
      <ellipse cx="150" cy="107" rx="96" ry="23" fill="url(#brim)"/>
      <path d="M74 106 C 82 58 110 30 150 24 C 172 22 186 34 178 52 C 192 74 210 92 224 106 C 190 122 108 122 74 106 Z" fill="url(#hat)"/>
      <path d="M150 28 C 130 44 120 74 116 104 C 104 96 104 66 116 44 C 126 32 138 28 150 28 Z" fill="#ffffff" opacity=".22"/>
      <ellipse cx="150" cy="100" rx="70" ry="14" fill="#3a1f7a" opacity=".35"/>
      <path d="M176 20 l6 15 15 6 -15 6 -6 16 -6 -16 -15 -6 15 -6 z" fill="url(#star)"/>
    </g>
    <circle cx="264" cy="150" r="4" fill="#fff0c0"/><circle cx="42" cy="176" r="3" fill="#fff" opacity=".7"/><path d="M250 120 q4 -8 8 0 q-4 -2 -8 0" fill="#fff" opacity=".5"/>
  </svg>`,
};
