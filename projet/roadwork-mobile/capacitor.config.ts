import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.roadwork.mobile',
  appName: 'RoadWork Mobile',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    Geolocation: {
      enableHighAccuracy: true
    },
    Camera: {
      quality: 90
    }
  }
};

export default config;