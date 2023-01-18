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
        <div class="px-2 overflow-x-auto block whitespace-nowrap pb-2">
          <ion-chip v-for="group in selected" :key="group.id">
            <ion-avatar>
              <img :src="group.picture.publicUrl"/>
            </ion-avatar>
            <ion-label class="font-bold">
              {{ group.name }}
            </ion-label>
            <ion-icon name="close-circle" @click="remove(group)"></ion-icon>
          </ion-chip>
        </div>
      </div>

      <ion-list lines="full" v-if="suggestions.length && !searchText">
        <ion-list-header>
          <ion-label>{{ texts.suggestions }}</ion-label>
        </ion-list-header>
        <ion-item v-for="group in suggestions" :key="group.id" mode="md">
          <ion-avatar slot="start">
            <img :src="group.picture.publicUrl"/>
          </ion-avatar>
          <ion-label class="font-bold">
            {{ group.name }}
          </ion-label>
          <ion-checkbox slot="end" @ionChange="toggle(group, $event)" :checked="isSelected(group.id)"></ion-checkbox>
        </ion-item>
      </ion-list>

      <div v-if="loadingSearch" class="flex justify-center p-8 w-full">
        <ion-spinner class="w-12 h-12" color="primary"/>
      </div>

      <ion-list lines="full" v-if="searchText && !loadingSearch && searchResults.length">
        <ion-list-header>
          <ion-label>{{ texts.results }}</ion-label>
        </ion-list-header>
        <ion-item v-for="group in searchResults" :key="group.id" mode="md">
          <ion-avatar slot="start">
            <img :src="group.picture.publicUrl"/>
          </ion-avatar>
          <ion-label class="font-bold">
            {{ group.name }}
          </ion-label>
          <ion-checkbox slot="end" @ionChange="toggle(group, $event)" :checked="isSelected(group.id)"></ion-checkbox>
        </ion-item>
      </ion-list>

      <empty-text v-if="!searchText && !loadingSearch && !suggestions.length" :text="texts.noSuggestions"/>
      <empty-text v-if="searchText && !loadingSearch && !searchResults.length" :text="texts.noResults"/>

    </ion-content>
  </div>
</template>
<script lang="ts">
import {Component, Prop, Vue, Watch} from 'vue-property-decorator'
import InputItem from '@/views/components/common/InputItem.vue'
import _ from 'lodash'
import EmptyText from '@/views/components/common/EmptyText.vue'
import {groupsProvider} from '@/providers/data/groups.provider'
import Group from '@/types/Group'
import {userModule} from '@/store/userModule'
import {locationModule} from '@/store/locationModule'

@Component({
  name: 'TagGroupsModal',
  components: {EmptyText, TextItem: InputItem}
})
export default class TagGroupsModal extends Vue {

  @Prop(Object)
  texts: { search: string, suggestions: string, selected: string, results: string, noResults: string, noSuggestions: string }

  @Prop(Boolean)
  isGroup: boolean

  @Prop(Number)
  groupId?: number

  @Prop(Array)
  initSelected: Group[]

  currentGroup: Group = null
  searchText: string = ''
  suggestions: Group[] = []
  selected: Group[] = []
  searchResults: Group[] = []

  loadingSearch = false
  debounceFind = _.debounce(this.findAll, 300, {leading: true,})

  @Watch('searchText')
  searchChanged() {
    this.search()
  }

  @Watch('selected')
  selectedChanged() {
    if (!this.isGroup && this.selected.length === 1) {
      this.close()
    }
  }

  mounted() {
    if (this.initSelected?.length) {
      this.selected = this.initSelected
    }
    if (this.isGroup) {
      groupsProvider.fetchGroup(this.groupId)
          .then((group) => {
            this.currentGroup = group
            this.fetchGroupSuggestions()
          })
    } else {
      this.fetchUserSuggestions()
    }
  }

  fetchUserSuggestions() {
    groupsProvider.fetchGroups(locationModule.userCoords, 1, 10, {includeUser: userModule.getCurrentUser.id})
        .then((groups) => this.suggestions = groups.data)
  }

  fetchGroupSuggestions() {
    groupsProvider.fetchGroups(this.currentGroup.coords, 1, 10, {excludeId: this.groupId})
        .then((groups) => this.suggestions = groups.data)
  }

  search() {
    this.loadingSearch = true
    this.debounceFind()
  }

  findAll() {
    groupsProvider.fetchGroups(this.isGroup ? this.currentGroup.coords : locationModule.userCoords, 1, 0, {
      search: this.searchText,
      excludeId: this.groupId
    }).then(({data}) => this.searchResults = data)
        .finally(() => this.loadingSearch = false)
  }

  isSelected(groupId) {
    return this.selected.some(({id}) => id === groupId)
  }

  clear() {
    this.searchText = ''
    this.searchResults = []
  }

  close() {
    this.$ionic.modalController.dismiss(this.selected)
  }

  toggle(group, event) {
    if (event.detail.checked) {
      if (this.isGroup) {
        this.add(group)
      } else {
        this.selected = [group]
      }
    } else {
      this.remove(group)
    }
  }

  add(group) {
    this.selected.push(group)
  }

  remove(group: Group) {
    if (this.isSelected(group.id)) {
      this.selected.splice(this.selected.findIndex(({id}) => id === group.id), 1)
    }
  }

}
</script>