import VueI18n from 'vue-i18n'
import messages from './messages'
import Vue from 'vue'
import moment from 'moment'

Vue.use(VueI18n)

const availableLocales = ['es', 'fr', 'en']
const navigatorLocale = window.navigator.language.split('-')[0]
const locale = availableLocales.includes(navigatorLocale) ? navigatorLocale : 'en'

moment.locale(locale)

export const i18n = new VueI18n({
  locale,
  messages
})
