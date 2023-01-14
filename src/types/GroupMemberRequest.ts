import User from '@/types/User'

export class GroupMemberRequestAnswer {
  question: { id: number }
  answer: string
}

export class GroupMemberRequest {
  id?: number
  user?: User
  answers: GroupMemberRequestAnswer[]
}