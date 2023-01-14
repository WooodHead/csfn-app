import User from '@/types/User'
import {ArrayNotEmpty, IsNotEmpty} from 'class-validator'
import Location from '@/types/Location'
import Image from '@/types/Image'
import {Exclude, Type} from 'class-transformer'
import Group from '@/types/Group'

export abstract class Activity {
  id?: number

  user?: User

  group?: Group

  @IsNotEmpty({message: 'required-error-f'})
  description: string

  @IsNotEmpty({message: 'required-error-f'})
  location: Location

  @ArrayNotEmpty({message: 'select-some-picture'})
  @Type(() => Object)
  pictures: (string | Blob | Image)[] = []

}
