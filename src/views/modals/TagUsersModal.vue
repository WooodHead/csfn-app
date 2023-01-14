<template>
  <div>
    <ion-header class="z-50" mode="ios">
      <ion-toolbar class="pb-2 flex items-center px-1" mode="ios">
        <ion-buttons slot="start" class="mt-3">
          <ion-button @click="close">
            <ion-icon slot="icon-only" color="dark" name="arrow-back"/>
          </ion-button>
        </ion-buttons>
        <text-item v-model="searchText" :clear="!!searchText" :outline="true" :placeholder="texts.search"
                   :rounded="true" ref="text-input" class="mt-2" icon="search" type="search" onBlur="clear"
                   @cleared="clear"></text-item>
        <ion-buttons slot="end" class="mt-3 ml-2">
          <ion-button color="primary" shape="round" size="large" class="text-xl" @click="close">
            Ok
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div v-if="selected.length">
        <ion-list-header>
          <ion-label>{{ texts.selected }}</ion-label>
        </ion-list-header>
        <div class="px-2 overflow-x-auto block whitespace-nowrap pb-2 space-x-1">
          <user-chip v-for="(user, i) in selected" :key="i" :user="user" removable @remove="remove(user)"/>
        </div>
      </div>

      <ion-list lines="full" v-if="suggestions.length && !searchText">
        <ion-list-header>
          <ion-label>{{ texts.suggestions }}</ion-label>
        </ion-list-header>
        <ion-item v-for="user in suggestions" :key="user.id" mode="md">
          <ion-avatar slot="start">
            <img :src="user.picture.publicUrl"/>
          </ion-avatar>
          <ion-label class="font-bold">
            {{ user.username }}
          </ion-label>
          <ion-checkbox slot="end" @ionChange="toggle(user, $event)" :checked="isSelected(user.id)"></ion-checkbox>
        </ion-item>
      </ion-list>

      <div v-if="loadingSearch" class="flex justify-center p-8 w-full">
        <ion-spinner class="w-12 h-12" color="primary"/>
      </div>

      <ion-list lines="full" v-if="searchText && !loadingSearch && searchResults.length">
        <ion-list-header>
          <ion-label>{{ texts.results }}</ion-label>
        </ion-list-header>
        <ion-item v-for="user in searchResults" :key="user.id" mode="md">
          <ion-avatar slot="start">
            <img :src="user.picture.publicUrl"/>
          </ion-avatar>
          <ion-label class="font-bold">
            {{ user.username }}
          </ion-label>
          <ion-checkbox slot="end" @ionChange="toggle(user, $event)" :checked="isSelected(user.id)"></ion-checkbox>
        </ion-item>
      </ion-list>

      <empty-text v-if="!searchText && !loadingSearch && !suggestions.length" :text="texts.noSuggestions"/>
      <empty-text v-if="searchText && !loadingSearch && !searchResults.length" :text="texts.noResults"/>
    </ion-content>
  </div>
</template>
<script lang="ts">
import {Component, Prop, Vue, Watch} from 'vue-property-decorator'
import User from '@/types/User'
import InputItem from '@/views/components/common/InputItem.vue'
import {userProvider} from '@/providers/data/user.provider'
import {userModule} from '@/store/userModule'
import _ from 'lodash'
import EmptyText from '@/views/components/common/EmptyText.vue'
import {groupsProvider} from '@/providers/data/groups.provider'
import UserChip from '@/views/components/common/UserChip.vue'
import {i18n} from '@/i18n'

@Component({
  name: 'TagUsersModal',
  components: {UserChip, EmptyText, TextItem: InputItem},
  inject: ['$i18n']
})
export default class TagUsersModal extends Vue {

  @Prop(Object)
  texts: { search: string, suggestions: string, selected: string, results: string, noResults: string, noSuggestions: string }

  @Prop(Boolean)
  isGroup: boolean

  @Prop(Number)
  groupId?: number

  @Prop(Array)
  initSelected: User[]

  searchText: string = ''
  suggestions: User[] = []
  selected: User[] = []
  searchResults: User[] = []

  loadingSearch = false
  debounceFind = _.debounce(this.findAll, 300, {leading: true,})

  @Watch('searchText')
  searchChanged() {
    this.search()
  }

  get currentUserId() {
    return userModule.getCurrentUser.id
  }

  mounted() {
    if (this.initSelected?.length) {
      this.selected = this.initSelected
    }
    if (this.isGroup) {
      this.fetchGroupSuggestions()
    } else {
      this.fetchUserSuggestions()
    }
  }

  fetchUserSuggestions() {
    userProvider.fetchUserGroups(this.currentUserId, 0, 0)
        .then(({data}) => data.map(group => group.group.id))
        .then((ids) => ids?.length ? userProvider.findAll({
          groupIds: ids,
          notId: this.currentUserId,
          limit: 0
        }) : {data: []})
        .then(({data}) => this.suggestions = data)
  }

  fetchGroupSuggestions() {
    groupsProvider.fetchGroupMembers(this.groupId, 1, 0)
        .then((users) => this.suggestions = users.data.map(({user}) => user))
  }

  search() {
    this.loadingSearch = true
    this.debounceFind()
  }

  findAll() {
    userProvider.findAll({search: this.searchText, notId: this.currentUserId, limit: 0})
        .then(({data}) => this.searchResults = data)
        .finally(() => this.loadingSearch = false)
  }

  isSelected(userId) {
    return this.selected.some((user) => user?.id === userId)
  }

  clear() {
    this.searchText = ''
    this.searchResults = []
  }

  close() {
    this.$ionic.modalController.dismiss(this.selected)
  }

  toggle(user, event) {
    if (event.detail.checked) {
      this.add(user)
    } else {
      this.remove(user)
    }
  }

  add(user) {
    this.selected.push(user)
  }

  remove(user) {
    if (this.isSelected(user?.id)) {
      this.selected.splice(this.selected.findIndex((selected) => selected?.id === user?.id), 1)
    }
  }

}
</script>