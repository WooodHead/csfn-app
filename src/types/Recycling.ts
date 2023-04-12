import {ArrayNotEmpty, IsNotEmpty, ValidateNested} from 'class-validator'
import User from '@/types/User'
import {Type} from 'class-transformer'
import Image from '@/types/Image'
import RecyclingItem from '@/types/RecyclingItem'
import RecyclingStation from '@/types/RecyclingStation'

export default class Recycling {

  id?: number

  user?: User

  @ArrayNotEmpty({message: 'select-some-picture'})
  @Type(() => Object)
  pictures: (string | Blob | Image)[] = []

  description: string

  @IsNotEmpty({message: 'required-error-f'})
  date: Date

  @Type(() => RecyclingItem)
  @ValidateNested()
  items: RecyclingItem[]

  station: RecyclingStation

}
