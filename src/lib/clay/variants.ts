/* 클레이 마법사 캐릭터 5종 (오리지널 SVG). class="char" 는 ClayChar에서 치환 */
export const VARIANT_KEYS = ["base", "star", "love", "mischief", "dream"] as const;
export type ClayVariant = (typeof VARIANT_KEYS)[number];

export const CLAY_VARIANTS: Record<string, string> = {
  base: `
  <svg class="char" viewBox="0 0 260 280" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="클레이 마법사 캐릭터">
    <defs>
      <radialGradient id="glow" cx="50%" cy="42%" r="55%"><stop offset="0%" stop-color="#c79bff" stop-opacity=".75"/><stop offset="60%" stop-color="#8b5cf6" stop-opacity=".25"/><stop offset="100%" stop-color="#8b5cf6" stop-opacity="0"/></radialGradient>
      <radialGradient id="body" cx="38%" cy="32%" r="78%"><stop offset="0%" stop-color="#fffaf0"/><stop offset="55%" stop-color="#ffeccc"/><stop offset="100%" stop-color="#eecb98"/></radialGradient>
      <linearGradient id="hat" x1="20%" y1="0%" x2="80%" y2="100%"><stop offset="0%" stop-color="#b58bff"/><stop offset="55%" stop-color="#8b5cf6"/><stop offset="100%" stop-color="#5d31b8"/></linearGradient>
      <radialGradient id="orb" cx="40%" cy="35%" r="70%"><stop offset="0%" stop-color="#ffe6ff"/><stop offset="45%" stop-color="#f0abfc"/><stop offset="100%" stop-color="#c026d3"/></radialGradient>
    </defs>
    <ellipse cx="130" cy="150" rx="120" ry="120" fill="url(#glow)"/>
    <ellipse cx="130" cy="250" rx="62" ry="13" fill="#2a0f55" opacity=".45"/>
    <path d="M130 96c46 0 78 34 78 80 0 42-32 66-78 66s-78-24-78-66c0-46 32-80 78-80z" fill="url(#body)"/>
    <path d="M130 96c46 0 78 34 78 80 0 12-3 22-8 31-6-50-40-79-86-79-13 0-25 3-35 9 14-26 30-41 51-41z" fill="#fff" opacity=".4"/>
    <ellipse cx="92" cy="150" rx="14" ry="9" fill="#ffc6d9" opacity=".55"/><ellipse cx="168" cy="150" rx="14" ry="9" fill="#ffc6d9" opacity=".55"/>
    <g><ellipse cx="108" cy="138" rx="9" ry="12" fill="#2b1a45"/><ellipse cx="152" cy="138" rx="9" ry="12" fill="#2b1a45"/><circle cx="111" cy="133" r="3.2" fill="#fff"/><circle cx="155" cy="133" r="3.2" fill="#fff"/></g>
    <path d="M120 158q10 9 20 0" stroke="#caa06a" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M84 196q-14 10-12 30" stroke="#eecb98" stroke-width="15" fill="none" stroke-linecap="round"/><path d="M176 196q14 10 12 30" stroke="#eecb98" stroke-width="15" fill="none" stroke-linecap="round"/>
    <circle cx="130" cy="228" r="26" fill="url(#orb)"/><circle cx="130" cy="228" r="26" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="1.5"/><circle cx="122" cy="220" r="6" fill="#fff" opacity=".8"/>
    <g transform="rotate(-7 130 70)"><ellipse cx="130" cy="92" rx="62" ry="15" fill="#5d31b8"/><ellipse cx="130" cy="89" rx="62" ry="15" fill="url(#hat)"/><path d="M96 90c8-46 20-72 36-78 10 22 6 52-6 82z" fill="url(#hat)"/><path d="M132 14c6 14 6 34 0 56-5-2-9-3-14-3 4-22 8-40 14-53z" fill="#fff" opacity=".22"/><path d="M130 8c10 4 14 18 12 30-6-4-12-4-18 0-3-12 0-24 6-30z" fill="url(#hat)"/><path d="M132 4l3.4 7 7.6.9-5.6 5.2 1.5 7.6-6.9-3.7-6.9 3.7 1.5-7.6-5.6-5.2 7.6-.9z" fill="#fcd34d"/><circle cx="112" cy="74" r="3.5" fill="#fcd34d" opacity=".9"/><circle cx="150" cy="58" r="2.6" fill="#fef3c7" opacity=".8"/></g>
  </svg>`,
  star: `
  <svg class="char" viewBox="0 0 260 280" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="클레이 마법사 - 놀란 표정">
    <defs>
      <radialGradient id="glow_star" cx="50%" cy="42%" r="55%"><stop offset="0%" stop-color="#c79bff" stop-opacity=".85"/><stop offset="60%" stop-color="#8b5cf6" stop-opacity=".3"/><stop offset="100%" stop-color="#8b5cf6" stop-opacity="0"/></radialGradient>
      <radialGradient id="body_star" cx="38%" cy="32%" r="78%"><stop offset="0%" stop-color="#fffaf0"/><stop offset="55%" stop-color="#ffeccc"/><stop offset="100%" stop-color="#eecb98"/></radialGradient>
      <linearGradient id="hat_star" x1="20%" y1="0%" x2="80%" y2="100%"><stop offset="0%" stop-color="#b58bff"/><stop offset="55%" stop-color="#8b5cf6"/><stop offset="100%" stop-color="#5d31b8"/></linearGradient>
      <radialGradient id="orb_star" cx="40%" cy="35%" r="70%"><stop offset="0%" stop-color="#ffe6ff"/><stop offset="45%" stop-color="#f0abfc"/><stop offset="100%" stop-color="#c026d3"/></radialGradient>
    </defs>
    <ellipse cx="130" cy="150" rx="120" ry="120" fill="url(#glow_star)"/><ellipse cx="130" cy="250" rx="62" ry="13" fill="#2a0f55" opacity=".45"/>
    <path d="M130 96c46 0 78 34 78 80 0 42-32 66-78 66s-78-24-78-66c0-46 32-80 78-80z" fill="url(#body_star)"/>
    <ellipse cx="92" cy="150" rx="14" ry="9" fill="#ffc6d9" opacity=".55"/><ellipse cx="168" cy="150" rx="14" ry="9" fill="#ffc6d9" opacity=".55"/>
    <g><ellipse cx="108" cy="138" rx="15" ry="18" fill="#2b1a45"/><ellipse cx="152" cy="138" rx="15" ry="18" fill="#2b1a45"/><path d="M108 128l1.7 3.5 3.8.5-2.8 2.6.7 3.8-3.4-1.8-3.4 1.8.7-3.8-2.8-2.6 3.8-.5z" fill="#fcd34d"/><path d="M152 128l1.7 3.5 3.8.5-2.8 2.6.7 3.8-3.4-1.8-3.4 1.8.7-3.8-2.8-2.6 3.8-.5z" fill="#fcd34d"/></g>
    <circle cx="130" cy="165" r="7" stroke="#caa06a" stroke-width="4" fill="none"/>
    <path d="M84 196q-14 10-12 30" stroke="#eecb98" stroke-width="15" fill="none" stroke-linecap="round"/><path d="M176 196q14 10 12 30" stroke="#eecb98" stroke-width="15" fill="none" stroke-linecap="round"/>
    <circle cx="130" cy="228" r="26" fill="url(#orb_star)"/><path d="M125 220l0.8 1.7 1.9.2-1.4 1.3.3 1.9-1.7-.9-1.7.9.3-1.9-1.4-1.3 1.9-.2z" fill="#fff" opacity=".8"/><path d="M135 230l0.8 1.7 1.9.2-1.4 1.3.3 1.9-1.7-.9-1.7.9.3-1.9-1.4-1.3 1.9-.2z" fill="#fff" opacity=".6"/>
    <g transform="rotate(-10 130 70)"><ellipse cx="130" cy="92" rx="62" ry="15" fill="#5d31b8"/><ellipse cx="130" cy="89" rx="62" ry="15" fill="url(#hat_star)"/><path d="M96 90c8-46 20-72 36-78 10 22 6 52-6 82z" fill="url(#hat_star)"/><path d="M132 4l3.4 7 7.6.9-5.6 5.2 1.5 7.6-6.9-3.7-6.9 3.7 1.5-7.6-5.6-5.2 7.6-.9z" fill="#fcd34d"/></g>
  </svg>`,
  love: `
  <svg class="char" viewBox="0 0 260 280" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="클레이 마법사 - 사랑에 빠진 표정">
    <defs>
      <radialGradient id="glow_love" cx="50%" cy="42%" r="55%"><stop offset="0%" stop-color="#ffb3d9" stop-opacity=".75"/><stop offset="60%" stop-color="#f472b6" stop-opacity=".25"/><stop offset="100%" stop-color="#f472b6" stop-opacity="0"/></radialGradient>
      <radialGradient id="body_love" cx="38%" cy="32%" r="78%"><stop offset="0%" stop-color="#fffaf0"/><stop offset="55%" stop-color="#ffeccc"/><stop offset="100%" stop-color="#eecb98"/></radialGradient>
      <linearGradient id="hat_love" x1="20%" y1="0%" x2="80%" y2="100%"><stop offset="0%" stop-color="#d9a8ff"/><stop offset="55%" stop-color="#b88bff"/><stop offset="100%" stop-color="#8a5cf6"/></linearGradient>
      <radialGradient id="orb_love" cx="40%" cy="35%" r="70%"><stop offset="0%" stop-color="#fff0f5"/><stop offset="45%" stop-color="#f472b6"/><stop offset="100%" stop-color="#db2777"/></radialGradient>
    </defs>
    <ellipse cx="130" cy="150" rx="120" ry="120" fill="url(#glow_love)"/><ellipse cx="130" cy="250" rx="62" ry="13" fill="#4c1d95" opacity=".35"/>
    <path d="M130 96c46 0 78 34 78 80 0 42-32 66-78 66s-78-24-78-66c0-46 32-80 78-80z" fill="url(#body_love)"/>
    <ellipse cx="92" cy="155" rx="18" ry="12" fill="#ff9eb5" opacity=".7"/><ellipse cx="168" cy="155" rx="18" ry="12" fill="#ff9eb5" opacity=".7"/>
    <g><path d="M108 130c-5-5-12-2-12 5 0 7 12 15 12 15s12-8 12-15c0-7-7-10-12-5z" fill="#f472b6"/><circle cx="106" cy="133" r="2.5" fill="#fff" opacity=".8"/><path d="M152 130c-5-5-12-2-12 5 0 7 12 15 12 15s12-8 12-15c0-7-7-10-12-5z" fill="#f472b6"/><circle cx="150" cy="133" r="2.5" fill="#fff" opacity=".8"/></g>
    <path d="M120 162q10 7 20 0" stroke="#caa06a" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M84 196q-14 10-12 30" stroke="#eecb98" stroke-width="15" fill="none" stroke-linecap="round"/><path d="M176 196q14 10 12 30" stroke="#eecb98" stroke-width="15" fill="none" stroke-linecap="round"/>
    <circle cx="130" cy="228" r="26" fill="url(#orb_love)"/><path d="M130 223c-2-2-5-.8-5 2.2 0 3 5 6.5 5 6.5s5-3.5 5-6.5c0-3-3-4.2-5-2.2z" fill="#fff" opacity=".7"/>
    <g transform="rotate(-7 130 70)"><ellipse cx="130" cy="92" rx="62" ry="15" fill="#8a5cf6"/><ellipse cx="130" cy="89" rx="62" ry="15" fill="url(#hat_love)"/><path d="M96 90c8-46 20-72 36-78 10 22 6 52-6 82z" fill="url(#hat_love)"/><path d="M132 4l3.4 7 7.6.9-5.6 5.2 1.5 7.6-6.9-3.7-6.9 3.7 1.5-7.6-5.6-5.2 7.6-.9z" fill="#fcd34d"/></g>
  </svg>`,
  mischief: `
  <svg class="char" viewBox="0 0 260 280" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="클레이 마법사 - 장난꾸러기 표정">
    <defs>
      <radialGradient id="glow_mis" cx="50%" cy="42%" r="55%"><stop offset="0%" stop-color="#c79bff" stop-opacity=".75"/><stop offset="60%" stop-color="#8b5cf6" stop-opacity=".25"/><stop offset="100%" stop-color="#8b5cf6" stop-opacity="0"/></radialGradient>
      <radialGradient id="body_mis" cx="38%" cy="32%" r="78%"><stop offset="0%" stop-color="#fffaf0"/><stop offset="55%" stop-color="#ffeccc"/><stop offset="100%" stop-color="#eecb98"/></radialGradient>
      <linearGradient id="hat_mis" x1="20%" y1="0%" x2="80%" y2="100%"><stop offset="0%" stop-color="#b58bff"/><stop offset="55%" stop-color="#8b5cf6"/><stop offset="100%" stop-color="#5d31b8"/></linearGradient>
      <radialGradient id="orb_mis" cx="40%" cy="35%" r="70%"><stop offset="0%" stop-color="#ffe6ff"/><stop offset="45%" stop-color="#f0abfc"/><stop offset="100%" stop-color="#c026d3"/></radialGradient>
    </defs>
    <ellipse cx="130" cy="150" rx="120" ry="120" fill="url(#glow_mis)"/><ellipse cx="130" cy="250" rx="62" ry="13" fill="#2a0f55" opacity=".45"/>
    <path d="M130 96c46 0 78 34 78 80 0 42-32 66-78 66s-78-24-78-66c0-46 32-80 78-80z" fill="url(#body_mis)"/>
    <ellipse cx="92" cy="150" rx="14" ry="9" fill="#ffc6d9" opacity=".55"/><ellipse cx="168" cy="150" rx="14" ry="9" fill="#ffc6d9" opacity=".55"/>
    <g><ellipse cx="108" cy="138" rx="9" ry="12" fill="#2b1a45"/><circle cx="111" cy="133" r="3.2" fill="#fff"/><path d="M142 138q10-6 20 0" stroke="#2b1a45" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M138 128q14-10 18 2" stroke="#2b1a45" stroke-width="2.5" fill="none" stroke-linecap="round"/></g>
    <path d="M120 160q15 10 12-4" stroke="#caa06a" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <path d="M84 196q-14 10-12 30" stroke="#eecb98" stroke-width="15" fill="none" stroke-linecap="round"/><path d="M130 196q14 10 12 30" stroke="#eecb98" stroke-width="15" fill="none" stroke-linecap="round"/>
    <circle cx="130" cy="228" r="26" fill="url(#orb_mis)"/>
    <g transform="rotate(-5 130 70)"><ellipse cx="130" cy="92" rx="62" ry="15" fill="#5d31b8"/><ellipse cx="130" cy="89" rx="62" ry="15" fill="url(#hat_mis)"/><path d="M96 90c8-46 20-72 36-78 10 22 6 52-6 82z" fill="url(#hat_mis)"/><path transform="rotate(15 132 4)" d="M132 4l3.4 7 7.6.9-5.6 5.2 1.5 7.6-6.9-3.7-6.9 3.7 1.5-7.6-5.6-5.2 7.6-.9z" fill="#fcd34d"/></g>
  </svg>`,
  dream: `
  <svg class="char" viewBox="0 0 260 280" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="클레이 마법사 - 꿈꾸는 표정">
    <defs>
      <radialGradient id="glow_dream" cx="50%" cy="42%" r="55%"><stop offset="0%" stop-color="#fff8e1" stop-opacity=".6"/><stop offset="60%" stop-color="#ffecb3" stop-opacity=".2"/><stop offset="100%" stop-color="#ffecb3" stop-opacity="0"/></radialGradient>
      <radialGradient id="body_dream" cx="38%" cy="32%" r="78%"><stop offset="0%" stop-color="#fffdf5"/><stop offset="55%" stop-color="#fff8e1"/><stop offset="100%" stop-color="#f5e0c0"/></radialGradient>
      <linearGradient id="hat_dream" x1="20%" y1="0%" x2="80%" y2="100%"><stop offset="0%" stop-color="#d1c4e9"/><stop offset="55%" stop-color="#b39ddb"/><stop offset="100%" stop-color="#7e57c2"/></linearGradient>
      <radialGradient id="orb_dream" cx="40%" cy="35%" r="70%"><stop offset="0%" stop-color="#fffde7"/><stop offset="45%" stop-color="#fff59d"/><stop offset="100%" stop-color="#fbc02d"/></radialGradient>
    </defs>
    <ellipse cx="130" cy="150" rx="120" ry="120" fill="url(#glow_dream)"/><ellipse cx="130" cy="250" rx="62" ry="13" fill="#1a0a3a" opacity=".55"/>
    <path d="M130 96c46 0 78 34 78 80 0 42-32 66-78 66s-78-24-78-66c0-46 32-80 78-80z" fill="url(#body_dream)"/>
    <ellipse cx="92" cy="150" rx="12" ry="8" fill="#ffc6d9" opacity=".45"/><ellipse cx="168" cy="150" rx="12" ry="8" fill="#ffc6d9" opacity=".45"/>
    <g><path d="M98 138q10 6 20 0" stroke="#1a0a3a" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M142 138q10 6 20 0" stroke="#1a0a3a" stroke-width="4" fill="none" stroke-linecap="round"/></g>
    <path d="M122 158q8 6 16 0" stroke="#CAA06A" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M84 196q-14 10-12 30" stroke="#f5e0c0" stroke-width="15" fill="none" stroke-linecap="round"/><path d="M176 196q14 10 12 30" stroke="#f5e0c0" stroke-width="15" fill="none" stroke-linecap="round"/>
    <circle cx="130" cy="228" r="26" fill="url(#orb_dream)"/><circle cx="122" cy="220" r="6" fill="#fff" opacity=".5"/>
    <g transform="rotate(-7 130 70)"><ellipse cx="130" cy="92" rx="62" ry="15" fill="#7e57c2"/><ellipse cx="130" cy="89" rx="62" ry="15" fill="url(#hat_dream)"/><path d="M96 90c8-46 20-72 36-78 10 22 6 52-6 82z" fill="url(#hat_dream)"/><path d="M132 4l3.4 7 7.6.9-5.6 5.2 1.5 7.6-6.9-3.7-6.9 3.7 1.5-7.6-5.6-5.2 7.6-.9z" fill="#fbc02d" opacity=".8"/></g>
  </svg>`,
};
