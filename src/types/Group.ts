import Coords from '@/types/Coords'
import Image from '@/types/Image'
import {IsNotEmpty} from 'class-validator'
import {Expose} from 'class-transformer'
import {GroupCategory} from '@/types/GroupCategory'
import {GroupCapability} from '@/types/GroupCapability'
import {RecyclingStats} from '@/types/RecyclingStats'

export default class Group {

  id?: number

  @Expose()
  @IsNotEmpty({message: 'required-error'})
  name: string

  @Expose()
  @IsNotEmpty({message: 'required-error-f'})
  mission: string

  @Expose()
  @IsNotEmpty({message: 'required-error'})
  description: string

  capabilities: GroupCapability[]

  @Expose()
  picture: Image

  @Expose()
  cover?: Image

  category: GroupCategory

  country: string

  countryCode: string

  city: string

  coords: Coords

  @Expose()
  instagram: string

  @Expose()
  web: string

  totalCleanups?: number

  totalWeight?: number

  totalVolume?: number

  recyclingStats?: RecyclingStats

  creation?: Date

  update?: Date

}