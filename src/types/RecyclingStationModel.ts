import RecyclingType, {RecyclingTypeId} from '@/types/RecyclingType'
import Group from '@/types/Group'
import {ArrayNotEmpty, IsNotEmpty} from 'class-validator'

export default class RecyclingStationModel {

  id?: number

  @IsNotEmpty({message: 'required-error'})
  name: string

  @ArrayNotEmpty({message: 'required-error-p'})
  types: RecyclingTypeId[] | RecyclingType[]

  manufacturer: Partial<Group>

}