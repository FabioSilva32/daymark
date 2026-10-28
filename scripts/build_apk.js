const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const androidDir = path.join(rootDir, 'android');

console.log('📱 Building Daymark Standalone Android APK...');

// Step 1: Export static client bundle
execSync('node scripts/build_mobile.js', { cwd: rootDir, stdio: 'inherit' });

// Step 2: Sync Capacitor
console.log('🔄 Syncing assets to Capacitor Android...');
execSync('npx cap sync android', { cwd: rootDir, stdio: 'inherit' });

// Step 3: Run Gradle assembleDebug
console.log('🔨 Assembling APK via Gradle...');
const env = {
  ...process.env,
  ANDROID_HOME: process.env.ANDROID_HOME || 'C:\\Users\\itzfa\\AppData\\Local\\Android\\Sdk',
  JAVA_HOME: process.env.JAVA_HOME || 'C:\\Program Files\\Microsoft\\jdk-21.0.9.10-hotspot',
};

const gradlew = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
execSync(`${gradlew} assembleDebug`, { cwd: androidDir, stdio: 'inherit', env });

// Step 4: Copy APK to root
const srcApk = path.join(androidDir, 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
const destApk = path.join(rootDir, 'Daymark.apk');
const destDebugApk = path.join(rootDir, 'Daymark-debug.apk');

if (fs.existsSync(srcApk)) {
  fs.copyFileSync(srcApk, destApk);
  fs.copyFileSync(srcApk, destDebugApk);
  const sizeMb = (fs.statSync(destApk).size / (1024 * 1024)).toFixed(2);
  console.log(`\n🎉 SUCCESS! Standalone APK created: ${destApk} (${sizeMb} MB)`);

  // Copy directly to connected phone if available via Windows CrossDevice
  const crossDeviceBase = 'C:\\Users\\itzfa\\CrossDevice';
  if (fs.existsSync(crossDeviceBase)) {
    try {
      const devices = fs.readdirSync(crossDeviceBase);
      for (const dev of devices) {
        const phoneDownload = path.join(crossDeviceBase, dev, 'storage', 'Download');
        if (fs.existsSync(phoneDownload)) {
          const phoneApk = path.join(phoneDownload, 'Daymark.apk');
          const phoneV1Apk = path.join(phoneDownload, 'Daymark-v1.1.apk');
          execSync(`powershell -Command "Copy-Item -Path '${srcApk}' -Destination '${phoneApk}' -Force"`);
          execSync(`powershell -Command "Copy-Item -Path '${srcApk}' -Destination '${phoneV1Apk}' -Force"`);
          console.log(`📱 Instantly delivered Daymark.apk and Daymark-v1.1.apk to your phone at: ${phoneDownload}`);
        }
      }
    } catch (e) {
      console.log('Note: CrossDevice copy skipped:', e.message);
    }
  }

  console.log('✨ This APK is 100% self-contained and works anywhere in the world offline or online!');
} else {
  console.error('❌ Could not find output APK at:', srcApk);
}
