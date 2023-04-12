<template>
  <ion-page class="ion-page">
    <ion-header mode="ios">
      <ion-toolbar mode="ios">
        <ion-buttons slot="start">
          <ion-button @click="$router.back()">
            <ion-icon slot="icon-only" color="dark" name="arrow-back"/>
          </ion-button>
        </ion-buttons>
        <ion-title>{{ this.$t('recyclings') }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content color="light">
      <ion-card class="p-2 overflow-visible flex m-3 text-black items-center justify-around bg-white" mode="ios" v-cloak>
        <stats-counter :icon-src="require('ionicons5/dist/svg/trash-outline.svg')" :label="type.type.name"
                       :max="1" progress-value="1" :key="'cleanups' + 0"
                       :value="type.totalCount" no-animate :colors="['#426eff', '#426eff']">
          <template slot="icon">
            <fa-icon :icon="type.icon" class="text-sm -mt-1"/>
          </template>
        </stats-counter>

        <stats-counter :icon-src="require('@/assets/img/icons/bag-outline.svg')"
                       progress-value="1" :label="$t('liters')" :max="1"
                       :value="stats.totalVolume" :key="'volume-'+ stats.totalVolume"
                       no-animate :colors="['#426eff', '#426eff']"/>

        <stats-counter :icon-src="require('@/assets/img/icons/scale-outline.svg')"
                       progress-value="1" :label="$t('kilos')" :max="1"
                       :value="stats.totalWeight" :key="'weight-' + stats.totalWeight"
                       no-animate :colors="['#426eff', '#426eff']"/>
      </ion-card>

      <recycling-card v-for="recycling in recyclings" :key="recycling.id" :recycling="recycling" title-location/>
      <ion-infinite-scroll @ionInfinite="nextRecyclings" :disabled="!hasMoreRecyclings"
                           :key="'i' + hasMoreRecyclings">
        <ion-infinite-scroll-content/>
      </ion-infinite-scroll>
    </ion-content>
  </ion-page>
</template>
<script lang="ts">
import {Component, Vue} from 'vue-property-decorator'
import Recycling from '@/types/Recycling'
import {recyclingsProvider} from '@/providers/data/recyclings.provider'
import {userModule} from '@/store/userModule'
import StatsCounter from '@/views/components/user/StatsCounter.vue'
import RecyclingCard from '@/views/components/common/RecyclingCard.vue'

@Component({
  name: 'current-user-recyclings-page',
  components: {StatsCounter, RecyclingCard}
})
export default class CurrentUserRecyclingsPage extends Vue {

  loadingRecyclings = false
  recyclingsPage = 1
  recyclings: Recycling[] = []
  hasMoreRecyclings = true
  totalRecyclings = 0

  get userId() {
    return userModule.getCurrentUser.id
  }

  get stats() {
    return userModule.getCurrentUser.recyclingStats
  }

  get type() {
    return this.stats.types[0]
  }

  mounted() {
    this.fetchRecyclings()
  }

  fetchRecyclings() {
    this.loadingRecyclings = true
    return recyclingsProvider.findAll({page: this.recyclingsPage, userId: this.userId})
        .then(({data, meta}) => {
          this.totalRecyclings = meta.totalItems
          if (this.recyclings?.length) {
            this.recyclings.push(...data)
          } else {
            this.recyclings = data
          }
          if (meta?.totalItems === this.recyclings.length) {
            this.hasMoreRecyclings = false
          }
        })
        .finally(() => this.loadingRecyclings = false)
  }

  nextRecyclings(event) {
    this.recyclingsPage++
    this.fetchRecyclings()
        .finally(() => event.target.complete())
  }
}
</script>