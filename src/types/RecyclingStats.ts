import {RecyclingTypeId} from '@/types/RecyclingType'

export interface RecyclingStats {

  totalRecyclings: number
  totalVolume: number
  totalWeight: number
  types: {
    totalCount: number
    totalRecyclings: number
    totalVolume: number
    totalWeight: number,
    type: RecyclingTypeId
  }[]

}