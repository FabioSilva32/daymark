const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const apiDir = path.join(rootDir, 'src', 'app', 'api');
const tempApiDir = path.join(rootDir, 'src', '_api_temp');

console.log('🚀 Starting Standalone Mobile Export...');

let apiMoved = false;

try {
  // 1. Temporarily move api directory so Next.js static export succeeds without server routes
  if (fs.existsSync(apiDir)) {
    fs.renameSync(apiDir, tempApiDir);
    apiMoved = true;
    console.log('📦 Temporarily stashed server API routes for mobile export.');
  }

  // 2. Run next build to produce static out/ folder
  console.log('⚡ Generating optimized static client export (out/)...');
  execSync('npx next build', {
    cwd: rootDir,
    stdio: 'inherit',
    env: { ...process.env, NEXT_EXPORT: 'true' },
  });

  console.log('✅ Static export completed in "out/" directory.');
} catch (err) {
  console.error('❌ Build failed:', err.message);
  process.exitCode = 1;
} finally {
  // 3. Always restore API routes back to original place
  if (apiMoved && fs.existsSync(tempApiDir)) {
    fs.renameSync(tempApiDir, apiDir);
    console.log('🔄 Restored server API routes to src/app/api.');
  }
}
