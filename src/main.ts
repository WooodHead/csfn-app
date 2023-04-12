import 'reflect-metadata'
import Vue from 'vue'
import Main from './App.vue'
import Ionic from '@ionic/vue'
import {store} from '@/store'
import {router} from '@/router'
import {i18n} from '@/i18n'
//import { FacebookLogin } from '@capacitor-community/facebook-login'
import '@codetrix-studio/capacitor-google-auth'
import '@capacitor-community/firebase-analytics'
import {defineCustomElements} from '@ionic/pwa-elements/loader'
import './icons'
import './assets/style/tailwind.css'
import * as _ from 'lodash'
import {localeString} from '@/tools/Utils'
import {scrollToSegment} from '@/mixins/scrollToSegment'
import {FirebaseDynamicLinks} from '@pantrist/capacitor-firebase-dynamic-links'
import {authModule} from '@/store/authModule'

Vue.config.productionTip = false
Vue.config.ignoredElements = [/^ion-/]

//registerWebPlugin(FacebookLogin)

Vue.use(Ionic)

Vue.filter('capitalize', function (value) {
  return _.capitalize(value)
})

Vue.filter('localeString', localeString)

Vue.directive('scroll-to-segment', scrollToSegment)

new Vue({store, router, i18n, render: h => h(Main)})
  .$mount('#app')

FirebaseDynamicLinks.addListener('deepLinkOpen', ({url}) => {
  const slug = url.split('/app').pop()

  if (slug) {
    router.push(slug)
    authModule.setLoggedRedirect(slug)
  }
})
defineCustomElements(window)
