import {CapacitorConfig} from '@capacitor/cli'

export default {
  appId: 'com.cleansomething.app',
  appName: 'CSFN',
  bundledWebRuntime: false,
  npmClient: 'npm',
  webDir: 'dist',
  backgroundColor: '#ffffffff',
  server: {
    hostname: 'native.cleansomethingfornothing.com',
    allowNavigation: [
      'app.cleansomethingfornothing.com'
    ],


    url: 'http://192.168.1.110:8888',
    cleartext: true


  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 10000,
      splashFullScreen: true,
      splashImmersive: false
    },
    GoogleAuth: {
      scopes: [
        'profile',
        'email'
      ],
      serverClientId: '597121035718-js77umaebmsjp5c9qbvjvc9oee4o1e85.apps.googleusercontent.com',
      forceCodeForRefreshToken: true
    },
    Keyboard: {
      resize: 'none'
    }
  }
} as CapacitorConfig
