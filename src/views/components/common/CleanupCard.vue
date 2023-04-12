<template>
  <ion-card button class="m-3 bg-white" mode="ios" @click="click">
    <div class="h-40 bg-gray-200">
      <transition name="fade">
        <ion-img v-if="cleanup" :src="cleanup.pictures[0].publicUrl"
             class="w-full h-full object-center object-cover"/>
        <ion-skeleton-text v-else animated class="w-full h-full m-0 absolute"></ion-skeleton-text>
      </transition>
    </div>

    <transition name="fade">
      <div v-if="cleanup">
        <ion-card-header mode="md">
          <ion-card-title mode="md" class="font-bold">
            {{ $t('cleanup-in') }}
            {{ cleanup.location.address.city }}
          </ion-card-title>
          <ion-card-subtitle mode="md" class="mt-1 cleanup-card__description">{{
              cleanup.description
            }}
          </ion-card-subtitle>
        </ion-card-header>
        <ion-card-content class="relative h-10">
          <div class="ion-text-wrap absolute left-0 ml-3 top-0">
            <ion-chip class="h-6 ml-0" color="secondary">
              <ion-icon :src="require('@/assets/img/icons/bag.svg')" class="ml-0 mr-2 text-sm"/>
              {{ cleanup.volume }} {{ $t('liters') }}
            </ion-chip>
            <ion-chip v-if="cleanup.weight" class="h-6" color="secondary">
              <ion-icon :src="require('@/assets/img/icons/scale.svg')" class="ml-0 mr-2 text-sm"/>
              {{ cleanup.weight | localeString }} {{ $t('kilos') }}
            </ion-chip>
          </div>
          <ion-label class="text-xs font-bold mr-4 absolute right-0 mt-2 top-0" color="medium" style="margin-bottom: 2px">
            {{ formattedDate }}
          </ion-label>
        </ion-card-content>
      </div>


      <div v-else class="p-2">
        <ion-skeleton-text animated></ion-skeleton-text>
        <ion-skeleton-text animated></ion-skeleton-text>
        <ion-skeleton-text animated></ion-skeleton-text>
        <div class="flex">
          <ion-skeleton-text animated class="mr-2 rounded-full"></ion-skeleton-text>
          <ion-skeleton-text animated class="mr-2 rounded-full"></ion-skeleton-text>
          <ion-skeleton-text animated class="rounded-full"></ion-skeleton-text>
        </div>
      </div>
    </transition>

  </ion-card>
</template>
<script lang=ts>
import Vue from 'vue'
import Component from 'vue-class-component'
import {Emit, Prop} from 'vue-property-decorator'
import moment from 'moment'
import Cleanup from '@/types/Cleanup'

@Component({
  name: 'map-cleanup-card'
})
export default class CleanupCard extends Vue {

  @Prop({type: Object})
  cleanup: Cleanup

  get formattedDate() {
    if (!this.cleanup)
      return undefined
    const s = moment(this.cleanup.date).fromNow()
    return s.charAt(0).toUpperCase() + s.slice(1)
  }

  @Emit('click')
  click() {
    return
  }

}
</script>
<style>
.cleanup-card__description {
  -webkit-box-orient: vertical;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  text-overflow: ellipsis;
  overflow: hidden;
}
</style>
