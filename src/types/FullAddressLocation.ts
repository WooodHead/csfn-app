import Coords from '@/types/Coords'
import FullAddress from '@/types/FullAddress'
import {IsNotEmptyObject, ValidateNested} from 'class-validator'
import {Type} from 'class-transformer'

export default class FullAddressLocation {

  @IsNotEmptyObject(null, {message: 'required-error-f'})
  @Type(() => FullAddress)
  @ValidateNested()
  address: FullAddress

  @IsNotEmptyObject(null, {message: 'required-error-f'})
  coords: Coords

  constructor(address: FullAddress,
              coords: Coords) {
    this.address = address
    this.coords = coords
  }

  public equals?(other: Location): boolean {
    return this.toString() == other.toString()
  }
}
