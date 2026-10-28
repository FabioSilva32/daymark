import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.daymark.app',
  appName: 'Daymark',
  webDir: 'out',
  backgroundColor: '#000000',
  android: {
    backgroundColor: '#000000',
  },
  server: {
    url: 'https://daymark-beryl-seven.vercel.app',
    cleartext: false,
  },
};

export default config;
