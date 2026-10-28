const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgIcon = `<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#140708" />
      <stop offset="50%" stop-color="#080808" />
      <stop offset="100%" stop-color="#020202" />
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
      <stop offset="0%" stop-color="#E50914" stop-opacity="0.25" />
      <stop offset="100%" stop-color="#E50914" stop-opacity="0" />
    </radialGradient>
  </defs>

  <!-- Background App Squircle for iOS / Android Phone App -->
  <rect width="512" height="512" rx="116" fill="url(#bgGrad)" />
  <rect x="2" y="2" width="508" height="508" rx="114" stroke="#2A1214" stroke-width="2.5" />
  <rect x="5" y="5" width="502" height="502" rx="111" stroke="#222222" stroke-width="1.5" />

  <!-- Ambient Glow Behind Logo -->
  <circle cx="256" cy="256" r="160" fill="url(#ambientGlow)" />

  <!-- DAYMARK 'D' ICON EMBLEM -->
  <g>
    <!-- Main Outer D Silhouette with Chamfered Corners -->
    <path d="M148 112 H268 C342 112 396 166 396 256 C396 346 342 400 268 400 H148 V112 Z" fill="url(#redGrad)" />
    
    <!-- Top Chamfer Highlight Cut -->
    <path d="M148 112 L216 112 L176 152 H148 V112 Z" fill="#FF7A80" opacity="0.6" />

    <!-- Inner Cutout Creating Modern Minimal Lettermark -->
    <path d="M216 182 H262 C302 182 328 214 328 256 C328 298 302 330 262 330 H216 V182 Z" fill="#080808" />

    <!-- Inner Horizon Daymark Slit / Diamond Compass Core -->
    <path d="M256 226 L278 256 L256 286 L234 256 Z" fill="url(#redGrad)" />

    <!-- Top Gloss Sheen -->
    <path d="M154 118 H268 C336 118 384 166 390 248 C366 186 316 160 252 160 H154 V118 Z" fill="url(#accentGrad)" />
  </g>
</svg>`;

const publicDir = path.join(__dirname, '..', 'public');

fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgIcon);
fs.writeFileSync(path.join(publicDir, 'logo.svg'), svgIcon);

async function generate() {
  const buf = Buffer.from(svgIcon);

  await sharp(buf)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'icon-512.png'));

  await sharp(buf)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'icon-192.png'));

  await sharp(buf)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  await sharp(buf)
    .resize(64, 64)
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));

  // ICO format using PNG 32x32
  await sharp(buf)
    .resize(32, 32)
    .toFormat('png')
    .toFile(path.join(publicDir, 'favicon.ico'));

  console.log('Successfully generated icon-512, icon-192, apple-touch-icon, favicon.png, favicon.ico!');
}

generate().catch(console.error);
