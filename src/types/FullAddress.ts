import {IsNotEmpty} from 'class-validator'

export default class FullAddress {

  @IsNotEmpty({message: 'required-error-f'})
  street: string

  @IsNotEmpty({message: 'required-error'})
  postalCode: string

  @IsNotEmpty({message: 'required-error-f'})
  city: string

  @IsNotEmpty({message: 'required-error'})
  state: string

  @IsNotEmpty({message: 'required-error'})
  country: string

  countryCode: string
}

