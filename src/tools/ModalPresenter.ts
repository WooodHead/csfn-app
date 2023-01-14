import Vue from 'vue'
import {i18n} from '@/i18n'

export default class ModalPresenter {
  public static present(ionic,
                        component,
                        props?,
                        cssClass?,
                        hideBackdrop?) {
    return ionic.modalController
      .create({
        showBackdrop: !hideBackdrop,
        mode: 'ios',
        cssClass,
        component,
        componentProps: {
          propsData: props,
          localVue: Vue,
          $i18n: i18n,
          provide: {
            $i18n() {
              return i18n
            }
          }
        },

      })
      .then(modal => modal.present().then(() => modal.onWillDismiss()))
  }
}
