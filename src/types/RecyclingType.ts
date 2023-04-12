export enum RecyclingTypeId {
  CIGARETTE_BUTT = 'CIGARETTE_BUTT'
}

export default class RecyclingType {
  id: RecyclingTypeId
  icon: string
  color: string
  name: string | { [language: string]: string }
  unitsPerKilo: number
  unitsPerLiter: number
}