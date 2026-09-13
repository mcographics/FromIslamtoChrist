import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mcographics.fromdarknesstolight',
  appName: 'From Darkness to Light',
  webDir: 'dist',
  bundledWebRuntime: false,
  android: {
    backgroundColor: '#10212d',
  },
};

export default config;
