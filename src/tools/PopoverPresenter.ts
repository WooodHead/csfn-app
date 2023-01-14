import {PopoverListItem} from '@/types/PopoverListItem'
import PopoverList from '@/views/components/common/PopoverList.vue'
import {PopoverOptions} from '@ionic/core'

export default class PopoverPresenter {

  static presentList(ionic, event, items: PopoverListItem[], options?: Partial<PopoverOptions>) {
    ionic.popoverController.create({
      event,
      mode: 'ios',
      component: PopoverList,
      componentProps: {
        propsData: {
          items,
          onDismiss: () => ionic.popoverController.dismiss()
        }
      },
      ...options
    }).then(popover => popover.present())
  }

}