import User from '@/types/User'
import DataProvider from '@/providers/data/data.provider'
import {handleBackError} from '@/tools/handleBackError'
import Cleanup from '@/types/Cleanup'
import UserGroup from '@/types/GroupMember'
import {PaginatedResult} from '@/types/PaginatedResult'
import {GroupStatus} from '@/types/GroupStatus'

export class UserProvider extends DataProvider {

  constructor() {
    super('/user')
  }

  findAll({groupIds, notId, search, limit}: { groupIds?: number[], notId?: number, search?: string, limit: number }):
    Promise<PaginatedResult<User>> {
    return this.http.get('/', {
      'filter.groups.group.id': groupIds ? `$in:${groupIds.join(',')}` : undefined,
      'filter.id': notId ? `$not:${notId}` : undefined,
      'search': search || undefined,
      'limit': limit
    })
      .then(({data}) => data)
  }

  updateUser(id: number, update: User): Promise<User> {
    return this.http.patch('/' + id, update)
      .then(({data}) => data)
      .catch(handleBackError('update-profile'))
  }

  fetchUserGroups(id: number, page: number, limit: number = 10, onlyAdmin?: boolean): Promise<PaginatedResult<UserGroup>> {
    return this.http.get(`/${id}/groups`, {page, limit, 'filter.isAdmin': onlyAdmin ? '$eq:true' : undefined})
      .then(({data}) => data)
      .catch(handleBackError('fetch-groups'))
  }

  fetchUserGroupStatus(userId: number, groupId: number): Promise<{ status: GroupStatus, requestId?: number }> {
    return this.http.get(`/${userId}/groups/${groupId}`)
      .then(({data}) => data)
      .catch(handleBackError('fetch-group-status'))
  }

  fetchGroupsHasRequests(userId: number): Promise<{ value: number }> {
    return this.http.get(`/${userId}/groups-has-requests`)
      .then(({data}) => data)
      .catch(handleBackError('fetch-groups'))
  }

  leaveGroup(userId: number, groupId: number) {
    return this.http.delete(`/${userId}/groups/${groupId}`)
      .then(() => undefined)
      .catch(handleBackError('leave-group'))
  }

  fetchTagRequest(userId: number, cleanupId: number) {
    return this.http.get(`/${userId}/tag-requests/${cleanupId}`)
      .then(({data}) => data)
  }

  fetchUser(): Promise<User> {
    return null
  }

  fetchUserCleanups(): Promise<Cleanup[]> {
    return Promise.resolve(undefined)
  }

  fetchUserEvents(): Promise<Cleanup[]> {
    return Promise.resolve(undefined)
  }

  fetchUserAlerts(): Promise<Cleanup[]> {
    return Promise.resolve(undefined)
  }

  changeUserPassword(): Promise<void> {
    return Promise.resolve(undefined)
  }

  removeUser(): Promise<void> {
    return Promise.resolve(undefined)
  }

}

export const userProvider = new UserProvider()
