import {Controllers} from '@ionic/vue'

export const askConfirmation = (ionic: Controllers, header, message, ok, cancel) => {
  return new Promise((resolve, reject) => ionic.alertController.create({
    header,
    message,
    buttons: [{
      role: 'cancel',
      text: cancel
    }, {
      text: ok,
      handler: resolve
    }]
  }).then(alert => alert.present()))
}