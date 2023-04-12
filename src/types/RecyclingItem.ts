import RecyclingType, {RecyclingTypeId} from '@/types/RecyclingType'
import {IsNotEmpty} from 'class-validator'

export default class RecyclingItem {

  type: RecyclingTypeId | RecyclingType

  @IsNotEmpty({message: 'required-error'})
  count: number

  @IsNotEmpty({message: 'required-error'})
  weight: number

  @IsNotEmpty({message: 'required-error'})
  volume: number

}