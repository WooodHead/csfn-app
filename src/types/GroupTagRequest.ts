import Cleanup from '@/types/Cleanup'
import User from '@/types/User'
import Group from '@/types/Group'

export class GroupTagRequest {
  cleanup: Cleanup
  user: User
  group: Group
}