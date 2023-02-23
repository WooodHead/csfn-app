import User from '@/types/User'
import {Action, Module, Mutation, VuexModule} from 'vuex-class-modules'
import {store} from '@/store/index'
import {userProvider} from '@/providers/data/user.provider'
import {authProvider} from '@/providers/data/auth.provider'
import {imagesProvider} from '@/providers/data/images.provider'
import Cleanup from '@/types/Cleanup'
import {cleanupsProvider} from '@/providers/data/cleanups.provider'
import levels from '@/assets/levels'
import {UserLevel} from '@/types/UserLevel'
import UserProfileStats from '@/types/UserProfileStats'
import {statsProvider} from '@/providers/data/stats.provider'
import moment from 'moment'
import Vue from 'vue'
import {FirebaseAnalytics} from '@capacitor-community/firebase-analytics'
import UserGroup from '@/types/GroupMember'
import Group from '@/types/Group'
import {groupsProvider} from '@/providers/data/groups.provider'
import {locationModule} from '@/store/locationModule'
import {PaginatedResult} from '@/types/PaginatedResult'
import {groupsModule} from '@/store/groupsModule'
import {GroupStatus} from '@/types/GroupStatus'

@Module
class UserModule extends VuexModule {

  private currentUser: User = null
  private viewingUser: User = null
  private loadingUserActivities = false
  private currentUserCleanups: Cleanup[] = []
  private loadingUserStats = false
  private currentUserStats: UserProfileStats[] = []
  private currentUserGroups: UserGroup[] = []
  private currentUserHasMoreGroups = true
  private currentUserHasMoreGroupSuggestions = true
  private groupSuggestions: Group[] = []
  private groupsHasRequests: number = null


  constructor() {
    super({store, name: 'user'})
  }

  get getCurrentUser(): User {
    return this.currentUser
  }

  get getCurrentUserLevel(): UserLevel {
    return levels.filter(level =>
      this.currentUser.totalCleanups < level.threshold.cleanups
      || this.currentUser.totalVolume < level.threshold.liters
      || this.currentUser.totalWeight < level.threshold.kilos)[0] || levels.slice(-1)[0]
  }

  get getViewingUser(): User {
    return this.viewingUser
  }

  get isLoadingUserActivities() {
    return this.loadingUserActivities
  }

  get getCurrentUserCleanups(): Cleanup[] {
    return this.currentUserCleanups
  }

  get isLoadingUserStats(): boolean {
    return this.loadingUserStats
  }

  get getCurrentUserStats(): UserProfileStats[] {
    return this.currentUserStats
  }

  get statsGroupBy(): 'month' | 'day' {
    return moment().diff(this.currentUser.firstCleanup, 'months') > 3
      ? 'month'
      : 'day'
  }

  get getCurrentUserGroups() {
    return this.currentUserGroups
  }

  get getCurrentUserHasMoreGroups() {
    return this.currentUserHasMoreGroups
  }

  get currentUserGroupSuggestions() {
    return this.groupSuggestions
  }

  get getCurrentUserHasMoreGroupSuggestions() {
    return this.currentUserHasMoreGroupSuggestions
  }

  get getGroupsHasRequests() {
    return this.groupsHasRequests
  }

  @Mutation
  setCurrentUser(user: User) {
    Vue.set(this, 'currentUser', user)
  }

  @Mutation
  setViewingUser(user: User) {
    this.viewingUser = user
  }

  @Mutation
  setLoadingUserActivities(value: boolean) {
    this.loadingUserActivities = value
  }

  @Mutation
  setCurrentUserCleanups(cleanups: Cleanup[]) {
    Vue.set(this, 'currentUserCleanups', cleanups)
  }

  @Mutation
  setLoadingUserStats(value: boolean) {
    this.loadingUserStats = value
  }

  @Mutation
  setCurrentUserStats(stats: UserProfileStats[]) {
    Vue.set(this, 'currentUserStats', stats)
  }

  @Mutation
  resetCurrentGroups() {
    this.currentUserGroups = null
  }

  @Mutation
  setCurrentUserGroups({groups, reset}: { groups: PaginatedResult<UserGroup>, reset: boolean }) {
    if (this.currentUserGroups?.length && !reset) {
      this.currentUserGroups.push(...groups.data)
    } else {
      this.currentUserGroups = groups.data
    }
    if (groups.meta?.totalItems === this.currentUserGroups.length) {
      this.currentUserHasMoreGroups = false
    }
  }

  @Mutation
  setGroupSuggestions(groups: PaginatedResult<Group>) {
    if (this.groupSuggestions?.length) {
      this.groupSuggestions.push(...groups.data)
    } else {
      this.groupSuggestions = groups.data
    }
    if (groups.meta?.totalItems === this.groupSuggestions.length) {
      this.currentUserHasMoreGroupSuggestions = false
    }
  }

  @Mutation
  setGroupHasRequests(value: number) {
    this.groupsHasRequests = value
  }

  @Action
  fetchViewingUser(id: string) {
    if (id === this.currentUser.username) {
      this.setViewingUser(this.currentUser)
      return Promise.resolve()
    }
    return userProvider.fetchUser()
      .then((user) => {
        this.setViewingUser(user)
      })
  }

  @Action
  fetchCurrentUser() {
    return authProvider.fetchCurrentUser()
      .then((user) => {
        this.setCurrentUser(user)
      })
  }

  @Action
  fetchCurrentUserCleanups() {
    this.setLoadingUserActivities(true)
    return cleanupsProvider.fetchUserCleanups(this.currentUser.id)
      .then((cleanups) => {
        this.setCurrentUserCleanups(cleanups)
        this.setLoadingUserActivities(false)
      })
      .catch((err) => {
        this.setLoadingUserActivities(false)
        return Promise.reject(err)
      })
  }

  @Action
  fetchCurrentUserStats() {
    if (!this.currentUser.firstCleanup)
      return Promise.resolve()

    this.setLoadingUserStats(true)
    return statsProvider.fetchUserStats(this.currentUser.id, this.statsGroupBy)
      .then((stats) => {
        this.setLoadingUserStats(false)
        this.setCurrentUserStats(stats)
      })
      .catch((err) => {
        this.setLoadingUserActivities(false)
        return Promise.reject(err)
      })
  }

  @Action
  fetchCurrentUserGroups({page, reset}: { page: number, reset: boolean }) {
    return userProvider.fetchUserGroups(this.currentUser.id, page)
      .then(groups => {
        this.setCurrentUserGroups({groups, reset})
        groups.data
          .filter(({status}) => status === GroupStatus.ADMIN)
          .forEach(({group: {id}}) => groupsModule.fetchGroupHasRequests(id))
      })
  }

  fetchCurrentUserGroupSuggestions(page: number) {
    return groupsProvider.fetchGroups(locationModule.userCoords, page, 5, {excludeUser: this.currentUser.id})
      .then((groups) => this.setGroupSuggestions(groups))
  }

  @Action
  fetchUserGroupsHasRequests() {
    return userProvider.fetchGroupsHasRequests(this.currentUser.id)
      .then(({value}) => this.setGroupHasRequests(value))
  }

  @Action
  updateUserPicture(picture) {
    return imagesProvider.uploadImages([picture as File], 'update-profile')
      .then((images) => this.updateUser({picture: {id: images[0].id}}))
  }

  @Action
  updateUser(user: User) {
    return userProvider.updateUser(this.currentUser.id, user)
      .then((user) => {
        FirebaseAnalytics.logEvent({name: 'update_profile', params: {fields: Object.keys(user)}})
        this.setCurrentUser(user)
      })
  }

  @Action
  fetchGroupStatus(groupId: number) {
    return userProvider.fetchUserGroupStatus(this.currentUser.id, groupId)
      .then(({status, requestId}) => {
        if (status === GroupStatus.ADMIN) {
          groupsModule.fetchGroupHasRequests(groupId)
        }
        return {status, requestId}
      })
  }

  @Action
  leaveGroup(groupId: number) {
    return userProvider.leaveGroup(this.currentUser.id, groupId)
  }

}

export const userModule = new UserModule()
