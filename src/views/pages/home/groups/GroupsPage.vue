<template>
  <page-transparent-header ref="page">
    <ion-page class="ion-page">
      <transparent-header :no-back="true" :no-gradient="true" :title="$t('groups')">
        <template slot="end-buttons">
          <ion-button @click="showInfo" shape="round">
            <ion-icon :src="require('ionicons5/dist/svg/information-circle-outline.svg')"/>
          </ion-button>
        </template>
      </transparent-header>

      <ion-content ref="events-content" :scroll-events="true" class="fullscreen " color="white"
                   @ionScroll="$refs['page'].scrolled($event)">
        <home-header :num="2">
          <div class="h-toolbar-top sm:ios:mb-2"></div>
          <div class="absolute bottom-0 mb-20 z-10 w-full left-0 px-2">
            <ion-card class="rounded-full ion-activatable" mode="ios" @click="$router.push('/search-group')">
              <ion-item>
                <ion-icon name="search" slot="start"/>
                <ion-label class="opacity-75">{{ $t('search-groups') }}</ion-label>
              </ion-item>
              <ion-ripple-effect/>
            </ion-card>
          </div>
        </home-header>

        <div v-if="loading" class="flex justify-center p-3 w-full absolute">
          <ion-spinner class="w-12 h-12" color="primary"/>
        </div>

        <div class="-mt-14">
          <group-card v-for="{group, status} in groups" :key="group.id" :group="group" :status="status"
                      @click="$router.push('/group/' + group.id)" :requests="groupRequests[group.id]"/>
        </div>

        <EmptyText :text="$t('no-groups')" v-if="!loading && !groups.length && !suggestions.length"/>

        <div class="pt-6 text-left relative" v-if="suggestions.length"
             :class="{'-mt-14': !groups.length}">
          <ion-label class="font-bold text-xl text-left ml-6" color="primary">{{ $t('suggestions') }}</ion-label>
          <group-card v-for="group in suggestions" :key="group.id" :group="group"
                      @click="openGroup(group)"/>
        </div>

        <ion-infinite-scroll @ionInfinite="next" :disabled="!hasMoreGroups && !hasMoreGroupSuggestions">
          <ion-infinite-scroll-content/>
        </ion-infinite-scroll>
        <div class="pb-32"/>
      </ion-content>
    </ion-page>
  </page-transparent-header>
</template>
<script lang=ts>
import Vue from 'vue'
import Component from 'vue-class-component'
import TransparentHeader from '@/views/components/common/TransparentHeader.vue'
import Wave from '@/views/components/common/Wave.vue'
import CleanupsList from '@/views/components/home/CleanupsList.vue'
import PageTransparentHeader from '@/views/components/common/PageTransparentHeader.vue'
import PlaceholderCard from '@/views/components/home/PlaceholderCard.vue'
import HomeHeader from '@/views/components/home/HomeHeader.vue'
import {userModule} from '@/store/userModule'
import GroupCard from '@/views/components/groups/GroupCard.vue'
import {groupsModule} from '@/store/groupsModule'
import EmptyText from '@/views/components/common/EmptyText.vue'

@Component({
  name: 'groups-page',
  components: {
    EmptyText,
    HomeHeader, PlaceholderCard, PageTransparentHeader, CleanupsList, Wave, TransparentHeader, GroupCard
  }
})
export default class GroupsPage extends Vue {

  loading = true
  userGroupsPage = 1
  suggestionsPage = 1

  get groups() {
    return userModule.getCurrentUserGroups
  }

  get hasMoreGroups() {
    return userModule.getCurrentUserHasMoreGroups
  }

  get hasMoreGroupSuggestions() {
    return userModule.getCurrentUserHasMoreGroupSuggestions
  }

  get suggestions() {
    return userModule.currentUserGroupSuggestions
  }

  get showSuggestions() {
    return this.groups?.length < 5 && !this.hasMoreGroups
  }

  get groupRequests() {
    return groupsModule.groupHasRequests
  }

  mounted() {
    userModule.resetCurrentGroups()
    userModule.resetGroupSuggestions()
    this.loading = true
  }

  init() {
    userModule.fetchUserGroupsHasRequests()
    this.fetchUserGroups()
        .then(() => {
          if (!this.hasMoreGroups) {
            return this.fetchSuggestions()
          }
        })
        .catch(console.error)
        .finally(() => {
          this.loading = false
        })
  }

  fetchUserGroups() {
    return userModule.fetchCurrentUserGroups(this.userGroupsPage)
  }

  fetchSuggestions() {
    return userModule.fetchCurrentUserGroupSuggestions(this.suggestionsPage)
  }

  openGroup(group) {
    groupsModule.setCurrentGroup(group)
    this.$router.push('/group/' + group.id)
  }

  next(event) {
    (this.hasMoreGroups ? this.nextUserGroups() : this.nextSuggestions())
        .finally(() => {
          event.target.complete()
        })
  }

  nextUserGroups(): Promise<void> {
    this.userGroupsPage++
    return this.fetchUserGroups()
  }

  nextSuggestions(): Promise<void> {
    this.suggestionsPage++
    return this.fetchSuggestions()
  }

  exit() {
    return
  }

  async showInfo() {
    await (await this.$ionic.alertController.create({
      header: this.$t('groups').toString(),
      message: this.$t('groups-info').toString(),
      buttons: [{
        text: this.$t('accept').toString(),
        role: 'cancel'
      }],
      cssClass: 'text-xs leading-5'
    })).present()
  }

}
</script>
