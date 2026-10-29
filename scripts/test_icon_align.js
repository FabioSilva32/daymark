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

function makeSvg(offsetX, diamondX) {
  return `
  <svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
    ${svgDefs}
    <!-- Background Circle representing Android Phone circle mask -->
    <circle cx="256" cy="256" r="240" fill="#0A0A0A" stroke="#262626" stroke-width="4"/>
    <!-- Circle crosshairs for visual alignment check -->
    <line x1="256" y1="0" x2="256" y2="512" stroke="#333333" stroke-width="1" stroke-dasharray="4,4"/>
    <line x1="0" y1="256" x2="512" y2="256" stroke="#333333" stroke-width="1" stroke-dasharray="4,4"/>

    <g transform="translate(256, 256) scale(0.68) translate(-${offsetX}, -256)">
      <circle cx="${offsetX}" cy="256" r="180" fill="url(#ambientGlow)" />
      <path d="M148 112 H268 C342 112 396 166 396 256 C396 346 342 400 268 400 H148 V112 Z" fill="url(#redGrad)" />
      <path d="M148 112 L216 112 L176 152 H148 V112 Z" fill="#FF7A80" opacity="0.6" />
      <path d="M216 182 H262 C302 182 328 214 328 256 C328 298 302 330 262 330 H216 V182 Z" fill="#050505" />
      <!-- Diamond compass core -->
      <path d="M${diamondX} 226 L${diamondX + 22} 256 L${diamondX} 286 L${diamondX - 22} 256 Z" fill="url(#redGrad)" />
      <path d="M154 118 H268 C336 118 384 166 390 248 C366 186 316 160 252 160 H154 V118 Z" fill="url(#accentGrad)" />
    </g>
  </svg>
  `;
}

async function run() {
  const scratchDir = path.join(__dirname, '..', 'scratch');
  if (!fs.existsSync(scratchDir)) fs.mkdirSync(scratchDir, { recursive: true });

  await sharp(Buffer.from(makeSvg(272, 256))).png().toFile(path.join(scratchDir, 'test_prev.png'));
  await sharp(Buffer.from(makeSvg(260, 264))).png().toFile(path.join(scratchDir, 'test_opt_260.png'));
  await sharp(Buffer.from(makeSvg(256, 266))).png().toFile(path.join(scratchDir, 'test_opt_256.png'));
  await sharp(Buffer.from(makeSvg(268, 272))).png().toFile(path.join(scratchDir, 'test_opt_268.png'));

  console.log('Generated test images in scratch/');
}
run();
