<template>
  <ion-card button class="m-3 bg-white" mode="ios" @click="click">
    <div class="h-40 relative">
      <ion-badge class="absolute top-0 left-0 m-2 opacity-90" color="blue">
        <fa-icon icon="fa-solid fa-recycle" class="mr-1"/>
        <ion-label>{{$t('recycling-station')}}</ion-label>
      </ion-badge>
      <transition name="fade">
        <img v-if="station" :src="station.pictures[0].publicUrl"
             class="w-full h-full object-center object-cover">
        <ion-skeleton-text v-else animated class="w-full h-full m-0 absolute"></ion-skeleton-text>
      </transition>
    </div>

    <transition name="fade">
      <div v-if="station">
        <ion-card-header mode="md">
          <ion-card-title mode="md" class="font-bold">
            {{ station.name }}
          </ion-card-title>
          <ion-card-subtitle mode="md" class="mt-1 cleanup-card__description">
            {{ station.description }}
          </ion-card-subtitle>
        </ion-card-header>
        <ion-card-content class="relative h-10">
          <div class="ion-text-wrap absolute left-0 ml-3 top-0">
            <ion-chip class="h-7 ml-0 flex items-center" >
              <div :style="{backgroundColor: type.color}" class="w-5 h-5 rounded-full flex items-center justify-center -ml-2 mr-2">
                <fa-icon :icon="type.icon" class="text-xs -mt-1"/>
              </div>
              <ion-label>{{ type.name }}</ion-label>
            </ion-chip>
          </div>
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
import RecyclingStation from '@/types/RecyclingStation'
import RecyclingType from '@/types/RecyclingType'

@Component({
  name: 'recycling-station-card'
})
export default class RecyclingStationCard extends Vue {

  @Prop({type: Object})
  station: RecyclingStation

  get type(): RecyclingType {
    return this.station?.model.types[0] as RecyclingType
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
