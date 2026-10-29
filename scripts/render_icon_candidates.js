const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgDefs = `
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#140708" />
      <stop offset="50%" stop-color="#080808" />
      <stop offset="100%" stop-color="#000000" />
    </linearGradient>
    <linearGradient id="redGrad" x1="120" y1="100" x2="390" y2="410" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FF242E" />
      <stop offset="40%" stop-color="#E50914" />
      <stop offset="100%" stop-color="#9E0008" />
    </linearGradient>
    <linearGradient id="accentGrad" x1="180" y1="160" x2="320" y2="340" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.25" />
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0" />
    </linearGradient>
    <radialGradient id="ambientGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#E50914" stop-opacity="0.35" />
      <stop offset="100%" stop-color="#E50914" stop-opacity="0" />
    </radialGradient>
  </defs>
`;

// In the D:
// Cutout hole is from X=216 to 328 (center = 272).
// Placing the diamond at 272 makes it 100% symmetrically centered in the hole!
function makeCell(offsetX, diamondX, label) {
  return `
    <g transform="translate(0, 0)">
      <circle cx="256" cy="256" r="230" fill="#050505" stroke="#222" stroke-width="2"/>
      <circle cx="256" cy="256" r="180" fill="url(#ambientGlow)" />
      <g transform="translate(256, 256) scale(0.68) translate(-${offsetX}, -256)">
        <path d="M148 112 H268 C342 112 396 166 396 256 C396 346 342 400 268 400 H148 V112 Z" fill="url(#redGrad)" />
        <path d="M148 112 L216 112 L176 152 H148 V112 Z" fill="#FF7A80" opacity="0.6" />
        <path d="M216 182 H262 C302 182 328 214 328 256 C328 298 302 330 262 330 H216 V182 Z" fill="#050505" />
        <!-- Diamond compass core centered in the hole -->
        <path d="M${diamondX} 226 L${diamondX + 22} 256 L${diamondX} 286 L${diamondX - 22} 256 Z" fill="url(#redGrad)" />
        <path d="M154 118 H268 C336 118 384 166 390 248 C366 186 316 160 252 160 H154 V118 Z" fill="url(#accentGrad)" />
      </g>
      <text x="256" y="470" fill="#888" font-size="20" font-family="sans-serif" text-anchor="middle">${label}</text>
    </g>
  `;
}

async function renderGrid() {
  const scratchDir = path.join(__dirname, '..', 'scratch');

  // Let's render individual single icons without crosshairs exactly like on the phone
  const configs = [
    { name: 'align_272_old', offsetX: 272, diamondX: 256, label: 'Old (offset 272, dia 256)' },
    { name: 'align_264_sym', offsetX: 264, diamondX: 272, label: 'Offset 264, dia 272' },
    { name: 'align_258_sym', offsetX: 258, diamondX: 272, label: 'Offset 258, dia 272' },
    { name: 'align_256_clean', offsetX: 256, diamondX: 272, label: 'Offset 256, dia 272' },
    { name: 'align_252_sym', offsetX: 252, diamondX: 272, label: 'Offset 252, dia 272' },
    { name: 'align_248_sym', offsetX: 248, diamondX: 272, label: 'Offset 248, dia 272' },
  ];

  for (const c of configs) {
    const svg = `
    <svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
      ${svgDefs}
      ${makeCell(c.offsetX, c.diamondX, c.label)}
    </svg>
    `;
    await sharp(Buffer.from(svg)).png().toFile(path.join(scratchDir, `${c.name}.png`));
  }

  console.log('Done rendering single phone icons');
}

renderGrid();
