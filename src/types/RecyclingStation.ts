import RecyclingStationModel from '@/types/RecyclingStationModel'
import Group from '@/types/Group'
import {ArrayNotEmpty, IsNotEmpty, IsNotEmptyObject, ValidateNested} from 'class-validator'
import {Type} from 'class-transformer'
import Image from '@/types/Image'
import FullAddressLocation from '@/types/FullAddressLocation'
import {RecyclingStats} from '@/types/RecyclingStats'

export default class RecyclingStation {

  id?: number

  @IsNotEmpty({message: 'required-error'})
  name: string

  @IsNotEmpty({message: 'required-error-f'})
  description: string

  @ArrayNotEmpty({message: 'select-some-picture'})
  @Type(() => Object)
  pictures: (string | Blob | Image)[] = []

  @IsNotEmpty({message: 'required-error'})
  model: Partial<RecyclingStationModel>

  @Type(() => FullAddressLocation)
  @ValidateNested()
  @IsNotEmptyObject()
  location?: FullAddressLocation

  owner: Partial<Group>

  distributor?: Partial<Group>

  removed?: boolean

  stats?: RecyclingStats

}