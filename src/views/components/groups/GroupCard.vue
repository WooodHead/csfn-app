<template>
  <ion-card :key="group.id" mode="ios" class="text-left" @click="$emit('click')" button>
    <div class="h-28 w-full" style="background: #eee">
      <ion-badge color="danger absolute top-0 right-0 mt-2 mr-2"v-if="requests">{{requests}}</ion-badge>

      <img :src="group.cover.publicUrl" v-if="group.cover" class="object-cover w-full h-full"
           style="width: 100%!important"/>
      <cover-placeholder v-else :image="group.picture.publicUrl"/>
    </div>
    <div class="relative">
      <div class="absolute right-0 top-0 mt-12 p-2" v-if="status">
        <group-status-button :status="status" readonly/>
      </div>
      <ion-avatar class="w-24 h-24 -mt-12 ml-3 bg-white z-10 relative">
        <ion-img :src="group.picture.publicUrl" class="rounded-full shadow-md"/>
      </ion-avatar>
      <ion-card-header mode="md">
        <ion-card-title mode="md" class="font-bold">{{ group.name }}</ion-card-title>
        <ion-card-subtitle mode="md" class="mt-1">{{ group.mission }}</ion-card-subtitle>
      </ion-card-header>
      <ion-card-content mode="md">
        <div class="flex items-center -mt-3 opacity-75">
          <ion-icon name="location-sharp" class="mr-1"/>
          {{ group.city }}, {{ group.country }}
        </div>
        <div class="mt-3 flex items-center justify-end">
          <count-chip small v-if="group.totalVolume" :count="group.totalVolume" type="liters"/>
          <count-chip small v-if="group.totalWeight !== '0.00'" :count="group.totalWeight" type="kilos"/>
        </div>
      </ion-card-content>
    </div>
  </ion-card>
</template>
<script lang="ts">
import Component from 'vue-class-component'
import Vue from 'vue'
import {Prop} from 'vue-property-decorator'
import Group from '@/types/Group'
import {GroupStatus} from '@/types/GroupStatus'
import CountChip from '@/views/components/common/CountChip.vue'
import CoverPlaceholder from '@/views/components/common/CoverPlaceholder.vue'
import GroupStatusButton from '@/views/components/groups/GroupStatusButton.vue'

@Component({
  name: 'group-card',
  components: {CountChip, CoverPlaceholder, GroupStatusButton}
})
export default class GroupCard extends Vue {

  @Prop({type: Object})
  group: Group

  @Prop({type: String})
  status: GroupStatus

  @Prop(Number)
  requests: number

}
</script>