import {Device} from '@capacitor/device'
import {SplashScreen} from '@capacitor/splash-screen'
import {StatusBar, Style} from '@capacitor/status-bar'

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
                        StatusBar.setOverlaysWebView({overlay: true}).catch(() => undefined)
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
