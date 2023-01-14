import {LocaleMessages} from 'vue-i18n'

export interface PopoverListItem {
  iconName?: string
  iconSrc?: string
  label: string | LocaleMessages
  onClick?: Function
}