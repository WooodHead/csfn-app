import {Device} from '@capacitor/device'
import {StatusBar, Style} from '@capacitor/status-bar'
import {SplashScreen} from '@capacitor/splash-screen'

class NativeProvider {

  mobile: boolean
  ios: boolean
  statusBarStyle: Style
  hidden = false

  isMobile(): Promise<boolean> {
    return ((this.mobile === undefined)
      ? Device.getInfo().then(({platform}) => {
        this.mobile = platform !== 'web'
      }) : Promise.resolve())
      .then(() => this.mobile)
  }

  isIOS(): Promise<boolean> {
    return ((this.ios === undefined)
      ? Device.getInfo().then(({platform}) => {
        this.ios = platform === 'ios'
      }) : Promise.resolve())
      .then(() => this.ios)
  }

  hideSplashScreen() {
    if (!this.hidden) {
      this.isMobile()
        .then((isMobile) => {
          if (isMobile) {
            StatusBar.setStyle({style: Style.Light})
            this.isIOS()
              .then(isIOS => !isIOS && StatusBar.setOverlaysWebView({overlay: true}))
            SplashScreen.hide()
            this.hidden = true
          }
        })
    }
  }

  setStatusBarStyle(style: Style) {
    this.statusBarStyle = style
    StatusBar.setStyle({style})
  }

  getStatusBarStyle() {
    return this.statusBarStyle
  }
}

export const nativeProvider = new NativeProvider()
