<template>
  <ion-page class="ion-page">
    <ion-header class="z-50" mode="ios">
      <ion-toolbar class="pb-2 flex items-center pr-6" mode="ios">
        <ion-buttons slot="start" class="mt-3">
          <ion-button @click="$router.back()">
            <ion-icon slot="icon-only" color="dark" name="arrow-back"/>
          </ion-button>
        </ion-buttons>
        <text-item v-model="searchText" :clear="true" :outline="true" :placeholder="$t('search-group')"
                   :rounded="true" ref="text-input"
                   class="mt-2" icon="search" type="search" onBlur="clear" @cleared="clear"></text-item>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div v-if="loading" class="flex justify-center p-8 w-full">
        <ion-spinner class="w-12 h-12" color="primary"/>
      </div>

      <div class="text-center p-4 font-bold opacity-50" v-if="!loading && searchResults && !searchResults.length">
        {{ $t('no-results') }}
      </div>

      <ion-list lines="full">
        <ion-item v-for="group in searchResults" :key="group.id" @click="click(group.id)" button>
          <ion-avatar slot="start" class="shadow-md">
            <ion-img :src="group.picture.publicUrl"/>
          </ion-avatar>

          <ion-label class="ion-text-wrap">
            <ion-text>
              <h3><span class="font-bold text-base">{{ group.name }}</span></h3>
            </ion-text>
            <span class="text-sm opacity-75">{{ group.mission }}</span>
            <span class="flex items-center opacity-50">
              <ion-icon name="location-sharp" class="mr-0"/>
              {{ group.city }}, {{ group.country }}
            </span>
          </ion-label>
        </ion-item>

        <ion-infinite-scroll @ionInfinite="next" :disabled="!hasMore" :key="'i' + hasMore">
          <ion-infinite-scroll-content/>
        </ion-infinite-scroll>

      </ion-list>
    </ion-content>
  </ion-page>
</template>
<script lang="ts">
import Component from 'vue-class-component'
import {Emit, Prop, Vue, Watch} from 'vue-property-decorator'
import InputItem from '@/views/components/common/InputItem.vue'
import {groupsModule} from '@/store/groupsModule'
import GroupCard from '@/views/components/groups/GroupCard.vue'
import _ from 'lodash'
import {userModule} from '@/store/userModule'

@Component({
  name: 'search-group',
  components: {TextItem: InputItem, GroupCard}
})
export default class SearchGroup extends Vue {

  @Prop(Boolean)
  excludeCurrentUser?: boolean

  searchText = ''
  loading = false
  page = 1
  debounceFetch = _.debounce(this.fetch, 300, {leading: true})

  get searchResults() {
    return groupsModule.getSearchResults
  }

  get hasMore() {
    return groupsModule.getHasMoreSearchResults
  }

  @Emit('click')
  click(id: number) {
    return id
  }

  @Watch('searchText')
  textChanged() {
    this.reset()
    this.search()
  }

  mounted() {
    this.reset()
    this.fetch()
    setTimeout(() => {
      (this.$refs['text-input'] as any).focus()
    }, 100)
  }

  search() {
    this.loading = true
    this.debounceFetch()
  }

  clear() {
    this.searchText = ''
  }

  fetch() {
    return groupsModule.search({
      text: this.searchText,
      page: this.page,
      excludeUser: this.excludeCurrentUser && userModule.getCurrentUser.id
    })
        .finally(() => this.loading = false)
  }

  next(event) {
    this.page++
    this.fetch()
        .finally(() => event.target.complete())
  }

  reset() {
    groupsModule.setSearchResults(null)
    this.page = 1
  }

}
</script>