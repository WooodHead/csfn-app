import {Action, Module, Mutation, VuexModule} from 'vuex-class-modules'
import {store} from '@/store/index'
import {groupsProvider} from '@/providers/data/groups.provider'
import {locationModule} from '@/store/locationModule'
import Group from '@/types/Group'
import {PaginatedResult} from '@/types/PaginatedResult'
import GroupCleanup from '@/types/GroupCleanup'
import Vue from 'vue'

@Module
class GroupsModule extends VuexModule {

  private searchResults: Group[] = null
  private hasMoreSearchResults = true
  private currentGroup: Group = null
  private currentGroupCleanups: GroupCleanup[] = null
  private currentGroupHasMoreCleanups = true
  private currentGroupCleanupsPage = 1
  private groupsRequests: Record<number, number> = {}
  private loadingGroupCleanups = false

  constructor() {
    super({name: 'groups', store})
  }

  get getSearchResults(): Group[] {
    return this.searchResults
  }

  get getHasMoreSearchResults() {
    return this.hasMoreSearchResults
  }

  get getCurrentGroup(): Group {
    return this.currentGroup
  }

  get getCurrentGroupCleanups(): GroupCleanup[] {
    return this.currentGroupCleanups
  }

  get getCurrentGroupHasMoreCleanups(): boolean {
    return this.currentGroupHasMoreCleanups
  }

  get getCurrentGroupCleanupsPage(): number {
    return this.currentGroupCleanupsPage
  }

  get groupHasRequests() {
    return this.groupsRequests
  }

  get isLoadingGroupCleanups() {
    return this.loadingGroupCleanups
  }

  @Mutation
  setSearchResults(value: PaginatedResult<Group>) {
    if (!value) {
      this.searchResults = null
      this.hasMoreSearchResults = false
      return
    }

    if (this.searchResults) {
      this.searchResults.push(...value.data)
    } else {
      this.searchResults = value.data
    }
    if (this.searchResults?.length === value?.meta.totalItems) {
      this.hasMoreSearchResults = false
    }
  }

  @Mutation
  resetCurrentCleanups() {
    this.currentGroupCleanups = null
    this.currentGroupHasMoreCleanups = true
    this.currentGroupCleanupsPage = 1
  }

  @Mutation
  setCurrentGroup(value: Group) {
    this.currentGroup = value
  }

  @Mutation
  setCurrentGroupCleanups(cleanups: PaginatedResult<GroupCleanup>) {
    if (this.currentGroupCleanups?.length) {
      this.currentGroupCleanups.push(...cleanups.data)
    } else {
      this.currentGroupCleanups = cleanups.data
    }
    if (cleanups.meta?.totalItems === this.currentGroupCleanups.length) {
      this.currentGroupHasMoreCleanups = false
    }
  }

  @Mutation
  setCurrentGroupHasMoreCleanups(value: boolean) {
    this.currentGroupHasMoreCleanups = value
  }

  @Mutation
  setCurrentGroupCleanupsPage(value: number) {
    this.currentGroupCleanupsPage = value
  }

  @Mutation
  setGroupHasRequests({id, value}: { id: number, value: number }) {
    Vue.set(this.groupsRequests, id, value)
  }

  @Mutation
  setLoadingGroupCleanups(value: boolean) {
    this.loadingGroupCleanups = value
  }

  @Action
  search({text, page, excludeUser}: { text: string, page: number, excludeUser?: number }) {
    return groupsProvider.fetchGroups(locationModule.userCoords, page, 10, {search: text, excludeUser})
      .then((results) => {
        this.setSearchResults(results)
      })
  }

  @Action
  fetchGroup(id: number) {
    return groupsProvider.fetchGroup(id)
      .then((group) => this.setCurrentGroup(group))
  }

  @Action
  fetchCurrentGroupCleanups() {
    this.setLoadingGroupCleanups(true)
    return groupsProvider.fetchCleanups(this.currentGroup.id, this.currentGroupCleanupsPage)
      .then((cleanups) => this.setCurrentGroupCleanups(cleanups))
      .finally(() => this.setLoadingGroupCleanups(false))
  }

  @Action
  fetchNextCleanups() {
    this.setCurrentGroupCleanupsPage(this.getCurrentGroupCleanupsPage + 1)
    return this.fetchCurrentGroupCleanups()
  }

  @Action
  updateGroup(group: Group) {
    return groupsProvider.updateGroup(this.currentGroup.id, group)
  }

  @Action
  fetchGroupRequests() {
    return groupsProvider.findUpdateRequests(this.currentGroup.id)
  }

  @Action
  fetchGroupHasRequests(id: number) {
    return groupsProvider.fetchGroupHasRequests(id)
      .then(({value}) => this.setGroupHasRequests({id, value}))
  }

}

export const
  groupsModule = new GroupsModule()