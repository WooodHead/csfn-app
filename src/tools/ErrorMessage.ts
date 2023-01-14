import CSFNError from '../types/errors/CSFNError'
import {i18n} from '@/i18n'

export default class ErrorMessage {
  public static getMessage(error: CSFNError): string {
    const errorKey = i18n.te('errors.' + error?.serverMessage) ? error?.serverMessage : (error?.message || 'unknown-error')

    return (i18n.t('errors.' + errorKey,
      {param: (i18n.t(error.param).toString()).toLowerCase()}).toString())
  }
}
