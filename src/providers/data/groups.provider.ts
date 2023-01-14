import DataProvider from '@/providers/data/data.provider'
import Coords from '@/types/Coords'
import {coordsToString} from '@/tools/Utils'
import Group from '@/types/Group'
import {PaginatedResult} from '@/types/PaginatedResult'
import GroupCleanup from '@/types/GroupCleanup'
import {GroupQuestion, GroupQuestions} from '@/types/GroupQuestions'
import UnknownError from '@/types/errors/UnknownError'
import {GroupUpdateRequest} from '@/types/GroupUpdateRequest'
import {GroupMemberRequest} from '@/types/GroupMemberRequest'
import User from '@/types/User'
import {GroupTagRequest} from '@/types/GroupTagRequest'
import {handleBackError} from '@/tools/handleBackError'

export class GroupsProvider extends DataProvider {

  constructor() {
    super('/groups')
  }

  fetchGroups(origin: Coords, page: number, limit: number, opts?: { excludeUser?: number, search?: string, includeUser?: number, excludeId?: number }) {
    const {
      excludeUser,
      includeUser,
      search,
      excludeId
    } = opts || {}
    return this.http.get('/', {
      origin: coordsToString(origin),
      page,
      limit,
      search,
      'filter.user': includeUser ? ('$eq:' + includeUser) : (excludeUser && '$not:' + excludeUser),
      'filter.id': excludeId && '$not:' + excludeId
    }).then(({data}) => data)
  }

  fetchGroup(id: number): Promise<Group> {
    return this.http.get('/' + id)
      .then(({data}) => data)
      .catch(() => Promise.reject(new UnknownError('fetch-group')))
  }

  updateGroup(id: number, update: Group): Promise<void> {
    return this.http.put('/' + id, update)
      .then(() => undefined)
      .catch(() => Promise.reject(new UnknownError('update-the-group')))
  }

  deleteGroup(id: number, username: string, password: string): Promise<void> {
    return this.http.delete('/' + id, {auth: {username, password}})
      .then(() => undefined)
  }

  fetchFirstCleanup(id: number): Promise<GroupCleanup> {
    return this.http.get('/' + id + '/cleanups?limit=1&sortBy=cleanup.date:ASC')
      .then(({data}) => data.data[0])
  }

  fetchCleanups(id: number, page: number): Promise<PaginatedResult<GroupCleanup>> {
    return this.http.get('/' + id + '/cleanups?page=' + page)
      .then(({data}) => data)
  }

  setGroupQuestions(id: number, questions: GroupQuestions) {
    return this.http.put(`/${id}/questions`, questions)
      .then(() => undefined)
  }

  findGroupQuestions(id): Promise<GroupQuestion[]> {
    return this.http.get(`/${id}/questions`)
      .then(({data}) => data)
  }

  findUpdateRequests(id: number): Promise<GroupUpdateRequest> {
    return this.http.get(`/${id}/update-request`)
      .then(({data}) => data)
  }

  sendMemberRequest(id: number, request: GroupMemberRequest) {
    return this.http.post(`/${id}/member-requests`, request)
      .then(() => undefined)
  }

  findMemberRequests(id: number): Promise<GroupMemberRequest[]> {
    return this.http.get(`/${id}/member-requests`)
      .then(({data}) => data)
  }

  approveMemberRequest(groupId: number, id: number) {
    return this.http.post(`/${groupId}/member-requests/${id}/approve`)
      .then(() => undefined)
  }

  removeMemberRequest(groupId: number, id: number) {
    return this.http.delete(`/${groupId}/member-requests/${id}`)
      .then(() => undefined)
  }

  sendTagRequest(id: number, cleanupId: number) {
    return this.http.post(`/${id}/tag-requests`, {cleanup: {id: cleanupId}})
      .then(() => undefined)
      .catch(handleBackError('send-tag-request'))
  }

  findTagRequests(id: number): Promise<GroupTagRequest[]> {
    return this.http.get(`/${id}/tag-requests`)
      .then(({data}) => data)
  }

  approveTagRequest(groupId: number, id: number) {
    return this.http.post(`/${groupId}/tag-requests/${id}/approve`)
      .then(() => undefined)
  }

  removeTagRequest(groupId: number, id: number) {
    return this.http.delete(`/${groupId}/tag-requests/${id}`)
      .then(() => undefined)
  }

  fetchGroupHasRequests(groupId): Promise<{ value: number }> {
    return this.http.get(`/${groupId}/has-requests`)
      .then(({data}) => data)
  }

  fetchGroupMembers(groupId, page, limit = 10): Promise<PaginatedResult<{ isAdmin: boolean, user: User }>> {
    return this.http.get(`/${groupId}/members?page=${page}&limit=${limit}`)
      .then(({data}) => data)
  }

  removeGroupMember(groupId: number, userId: number) {
    return this.http.delete(`/${groupId}/members/${userId}`)
      .then(() => undefined)
  }

  updateGroupMember(groupId: number, userId: number, {isAdmin}: { isAdmin: boolean }) {
    return this.http.patch(`/${groupId}/members/${userId}`, {isAdmin})
      .then(() => undefined)
  }

  async downloadReport(groupId: number, start: string, end: string, locale: string) {
    return this.http.downloadFile(`/${groupId}/report`, `report_${start}_${end}.pdf`, {start, end, locale})
      .catch(handleBackError('download-the-report'))
  }
}

export const groupsProvider = new GroupsProvider()