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
    },
    CapacitorHttp: {
      enabled: true
    },
    SplashScreen: {
      showSpinner: true,
      showSplashAutoHide: true,
      spinnerStyle: 'default'
    },
    StatusBar: {
      style: 'light'
    }
  },
  android: {
    preferences: {
      // Accélération matérielle
      'android-hardwareAccelerated': 'true',
      'android-minSdkVersion': '24',
      'android-targetSdkVersion': '33',
      // WebView moderne
      'AndroidXEnabled': 'true',
      'WKWebViewOnly': 'true',
      // Optimisations mémoire
      'android-allowMixedContent': 'true',
      'android-webview-debuggable': 'false',
      'android-launchMode': 'singleTask'
    }
  }
};

export default config;