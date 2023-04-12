import User from '@/types/User'
import RecyclingItem from '@/types/RecyclingItem'

export interface StationUser {
  user: User
  count: number
  types: RecyclingItem[]
}