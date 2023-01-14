import CSFNError from '@/types/errors/CSFNError'

export default class UnknownError implements CSFNError {

  message = 'unknown-error'
  param: string
  serverMessage: string

  constructor(action: string, serverMessage?: string) {
    this.param = action
    this.serverMessage = serverMessage
  }

}
