import {CapacitorConfig} from '@capacitor/cli'

const {networkInterfaces} = require('os')

const address = networkInterfaces()['en0'][1].address

export default {
  appId: 'com.cleansomething.app',
  appName: 'CSFN',
  bundledWebRuntime: false,
  npmClient: 'npm',
  webDir: 'dist',
  backgroundColor: '#ffffffff',
  server: {
    url: process.env.NODE_ENV === 'development' ? `http://${address}:8080` : undefined,
    cleartext: true,
    hostname: 'native.cleansomethingfornothing.com',
    allowNavigation: [
      'app.cleansomethingfornothing.com'
    ],
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 10000,
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
