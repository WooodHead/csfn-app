import {ArrayNotEmpty, IsArray, IsNotEmpty, IsOptional, ValidateIf} from 'class-validator'
import {Activity} from '@/types/Activity'
import User from '@/types/User'
import Group from '@/types/Group'

export default class Cleanup extends Activity {

  @IsNotEmpty({message: 'required-error-f'})
  date: Date

  @IsNotEmpty({message: 'required-error'})
  weight?: number

  @IsNotEmpty({message: 'required-error'})
  volume?: number

  @IsArray()
  @ArrayNotEmpty({message: 'tag-some-user'})
  @ValidateIf((o) => o.group?.id)
  taggedUsers: User[]

  @IsArray()
  @IsOptional()
  taggedGroups: Group[]

}
