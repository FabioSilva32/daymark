const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const workoutsDir = path.join(__dirname, '../public/images/workouts');

async function createCovers() {
  // Use existing photos with distinct tone shifts and crisp dark gym styling
  // 1. upper.jpg: Upper body focused toning (deep charcoal with crimson rim)
  await sharp(path.join(workoutsDir, 'push.jpg'))
    .modulate({ brightness: 0.9, saturation: 1.1 })
    .tint({ r: 230, g: 30, b: 30 })
    .composite([
      {
        input: Buffer.from(`
          <svg width="1376" height="768" xmlns="http://www.w3.org/2000/svg">
            <rect width="1376" height="768" fill="rgba(0,0,0,0.4)" />
            <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#E50914" stop-opacity="0.3"/>
              <stop offset="100%" stop-color="#000000" stop-opacity="0.8"/>
            </linearGradient>
            <rect width="1376" height="768" fill="url(#g)" />
          </svg>
        `),
        blend: 'over'
      }
    ])
    .jpeg({ quality: 90 })
    .toFile(path.join(workoutsDir, 'upper.jpg'));

  // 2. fullbody.jpg: High contrast athletic monochrome with red core
  await sharp(path.join(workoutsDir, 'pull.jpg'))
    .grayscale()
    .modulate({ brightness: 0.85, contrast: 1.3 })
    .composite([
      {
        input: Buffer.from(`
          <svg width="1376" height="768" xmlns="http://www.w3.org/2000/svg">
            <linearGradient id="g2" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stop-color="#000000" stop-opacity="0.85"/>
              <stop offset="50%" stop-color="#E50914" stop-opacity="0.2"/>
              <stop offset="100%" stop-color="#111111" stop-opacity="0.7"/>
            </linearGradient>
            <rect width="1376" height="768" fill="url(#g2)" />
          </svg>
        `),
        blend: 'over'
      }
    ])
    .jpeg({ quality: 90 })
    .toFile(path.join(workoutsDir, 'fullbody.jpg'));

  // 3. cardio.jpg: High intensity dynamic dark red & deep ember
  await sharp(path.join(workoutsDir, 'legs.jpg'))
    .modulate({ brightness: 0.8, saturation: 1.4 })
    .composite([
      {
        input: Buffer.from(`
          <svg width="1376" height="768" xmlns="http://www.w3.org/2000/svg">
            <radialGradient id="rg" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stop-color="#FF1E27" stop-opacity="0.35"/>
              <stop offset="100%" stop-color="#000000" stop-opacity="0.9"/>
            </radialGradient>
            <rect width="1376" height="768" fill="url(#rg)" />
          </svg>
        `),
        blend: 'over'
      }
    ])
    .jpeg({ quality: 90 })
    .toFile(path.join(workoutsDir, 'cardio.jpg'));

  console.log('Successfully created upper.jpg, fullbody.jpg, and cardio.jpg');
}

createCovers().catch(console.error);
