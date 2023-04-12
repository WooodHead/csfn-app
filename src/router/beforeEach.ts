import {Route} from 'vue-router'
import {authModule} from '@/store/authModule'
import {appModule} from '@/store/appModule'
import {LoggedResult} from '@/types/LoggedResult'
import {nativeProvider} from '@/providers/native/native.provider'

export default function beforeEach(to: Route,
                                   _: Route,
                                   next: Function) {
  appModule.initialize()
    .then((result: LoggedResult) => {
      const isLogged = authModule.isLogged
      if (result?.redirect) {
        next(result.redirect)
      } else if (!isLogged && !to.meta.public) {
        next('/login')
      } else if (isLogged && to.meta.public) {
        next('/')
      } else {
        next()
      }
      nativeProvider.hideSplashScreen()
    })
}
