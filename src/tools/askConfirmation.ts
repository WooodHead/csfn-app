import {Controllers} from '@ionic/vue'
import {LocaleMessages} from 'vue-i18n'

export const askConfirmation = (ionic: Controllers, header: string | LocaleMessages, message: string | LocaleMessages, ok: string | LocaleMessages, cancel: string | LocaleMessages) => {
  return new Promise((resolve, reject) => ionic.alertController.create({
    header: header as string,
    message: message as string,
    buttons: [{
      role: 'cancel',
      text: cancel as string
    }, {
      text: ok as string,
      handler: resolve
    }]
  }).then(alert => alert.present()))
}