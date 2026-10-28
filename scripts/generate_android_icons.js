const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const resDir = path.join(rootDir, 'android', 'app', 'src', 'main', 'res');
const publicDir = path.join(rootDir, 'public');

// Core SVG Gradients & Filters
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
      <stop offset="0%" stop-color="#E50914" stop-opacity="0.32" />
      <stop offset="100%" stop-color="#E50914" stop-opacity="0" />
    </radialGradient>
  </defs>
`;

// Centered emblem snippet (scales around true center 256,256)
function getEmblemGroup(scale = 0.72) {
  return `
    <g transform="translate(256, 256) scale(${scale}) translate(-272, -256)">
      <!-- Ambient Glow Behind Logo -->
      <circle cx="272" cy="256" r="180" fill="url(#ambientGlow)" />

      <!-- Main Outer D Silhouette with Chamfered Corners -->
      <path d="M148 112 H268 C342 112 396 166 396 256 C396 346 342 400 268 400 H148 V112 Z" fill="url(#redGrad)" />
      
      <!-- Top Chamfer Highlight Cut -->
      <path d="M148 112 L216 112 L176 152 H148 V112 Z" fill="#FF7A80" opacity="0.6" />

      <!-- Inner Cutout Creating Modern Minimal Lettermark -->
      <path d="M216 182 H262 C302 182 328 214 328 256 C328 298 302 330 262 330 H216 V182 Z" fill="#050505" />

      <!-- Inner Horizon Daymark Slit / Diamond Compass Core -->
      <path d="M256 226 L278 256 L256 286 L234 256 Z" fill="url(#redGrad)" />

      <!-- Top Gloss Sheen -->
      <path d="M154 118 H268 C336 118 384 166 390 248 C366 186 316 160 252 160 H154 V118 Z" fill="url(#accentGrad)" />
    </g>
  `;
}

// 1. Adaptive Foreground: Completely transparent background, emblem perfectly padded (scale 0.70)
// In Android's 108dp canvas, the safe zone mask is the inner 72dp.
// Scale 0.70 guarantees the emblem never touches the edge of circle/squircle masks.
const foregroundSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  ${svgDefs}
  ${getEmblemGroup(0.70)}
</svg>
`;

// 2. Legacy Squircle Icon (ic_launcher.png)
const legacySquircleSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  ${svgDefs}
  <rect x="8" y="8" width="496" height="496" rx="116" fill="url(#bgGrad)" />
  <rect x="10" y="10" width="492" height="492" rx="114" stroke="#2A1214" stroke-width="2" />
  <rect x="12" y="12" width="488" height="488" rx="112" stroke="#1F1F1F" stroke-width="1.5" />
  ${getEmblemGroup(0.70)}
</svg>
`;

// 3. Legacy Round Icon (ic_launcher_round.png)
const legacyRoundSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  ${svgDefs}
  <circle cx="256" cy="256" r="248" fill="url(#bgGrad)" />
  <circle cx="256" cy="256" r="246" stroke="#2A1214" stroke-width="2" />
  <circle cx="256" cy="256" r="244" stroke="#1F1F1F" stroke-width="1.5" />
  ${getEmblemGroup(0.66)}
</svg>
`;

const foregroundBuf = Buffer.from(foregroundSvg);
const legacySquircleBuf = Buffer.from(legacySquircleSvg);
const legacyRoundBuf = Buffer.from(legacyRoundSvg);

// Density mappings
// Adaptive foreground size is 108dp base (mdpi: 108, hdpi: 162, xhdpi: 216, xxhdpi: 324, xxxhdpi: 432)
// Legacy icon size is 48dp base (mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192)
const densities = [
  { folder: 'mipmap-mdpi', fgSize: 108, legacySize: 48 },
  { folder: 'mipmap-hdpi', fgSize: 162, legacySize: 72 },
  { folder: 'mipmap-xhdpi', fgSize: 216, legacySize: 96 },
  { folder: 'mipmap-xxhdpi', fgSize: 324, legacySize: 144 },
  { folder: 'mipmap-xxxhdpi', fgSize: 432, legacySize: 192 },
];

async function generateAll() {
  console.log('🎨 Generating perfectly scaled Android and Web icons...');

  // 1. Android Mipmap densities
  for (const d of densities) {
    const targetDir = path.join(resDir, d.folder);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Adaptive foreground (transparent bg, padded emblem)
    await sharp(foregroundBuf)
      .resize(d.fgSize, d.fgSize)
      .png()
      .toFile(path.join(targetDir, 'ic_launcher_foreground.png'));

    // Legacy standard squircle
    await sharp(legacySquircleBuf)
      .resize(d.legacySize, d.legacySize)
      .png()
      .toFile(path.join(targetDir, 'ic_launcher.png'));

    // Legacy round
    await sharp(legacyRoundBuf)
      .resize(d.legacySize, d.legacySize)
      .png()
      .toFile(path.join(targetDir, 'ic_launcher_round.png'));

    console.log(`  ✓ Generated icons for ${d.folder} (fg: ${d.fgSize}x${d.fgSize}, legacy: ${d.legacySize}x${d.legacySize})`);
  }

  // 2. Ensure drawable/ic_launcher_background.xml is clean solid black
  const drawableBgPath = path.join(resDir, 'drawable', 'ic_launcher_background.xml');
  const drawableBgContent = `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportHeight="108"
    android:viewportWidth="108">
    <path
        android:fillColor="#000000"
        android:pathData="M0,0h108v108h-108z" />
</vector>
`;
  fs.writeFileSync(drawableBgPath, drawableBgContent, 'utf8');
  console.log('  ✓ Updated drawable/ic_launcher_background.xml to pitch black');

  // 3. Web & PWA icons in public/
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), legacySquircleSvg);
  fs.writeFileSync(path.join(publicDir, 'logo.svg'), legacySquircleSvg);

  await sharp(legacySquircleBuf)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'icon-512.png'));

  await sharp(legacySquircleBuf)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'icon-192.png'));

  await sharp(legacySquircleBuf)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  await sharp(legacySquircleBuf)
    .resize(64, 64)
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));

  await sharp(legacySquircleBuf)
    .resize(32, 32)
    .toFormat('png')
    .toFile(path.join(publicDir, 'favicon.ico'));

  console.log('  ✓ Updated Web / PWA icons in public/');
  console.log('✨ All Android & Web icons successfully regenerated with elegant safe-zone margins!');
}

generateAll().catch(err => {
  console.error('❌ Error generating icons:', err);
  process.exit(1);
});
