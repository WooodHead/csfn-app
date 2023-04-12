<template>
  <ion-card mode="ios" class="p-2 m-3 bg-white"
            button @click="$router.push('/recyclings/' + recycling.id)">
    <div class="flex">
      <ion-thumbnail class="w-20 h-20 bg-gray-200" style="min-width: 5rem;">
        <ion-img :src="recycling.pictures[0].publicUrl" class="w-20 h-20 object-cover rounded"/>
      </ion-thumbnail>
      <div class="ml-2 overflow-hidden overflow-ellipsis">
        <ion-label class="font-bold text-black pl-1 whitespace-nowrap overflow-hidden ">
          {{ !titleLocation ? $t('recycling-by', [recycling.user.username]) : $t('recycling-in', [recycling.station.location.address.city]) }}
        </ion-label>
        <div class="recycling-card-chips">
          <ion-chip v-for="item in recycling.items" :key="item.id" color="blue" class="pt-2">
            <fa-icon :icon="item.type.icon || ''" class="-ml-1 mr-2 -mt-1"/>
            <ion-label>{{ item.count }} {{ item.type.name }}</ion-label>
          </ion-chip>
          <br>
          <count-chip :count="recycling.volume" type="liters" large color="blue"/>
          <count-chip :count="recycling.weight" type="kilos" large color="blue"/>
        </div>
      </div>
    </div>
  </ion-card>
</template>
<script lang="ts">
import {Prop, Vue} from 'vue-property-decorator'
import Component from 'vue-class-component'
import Recycling from '@/types/Recycling'
import CountChip from '@/views/components/common/CountChip.vue'

@Component({
  name: 'recycling-card',
  components: {CountChip}
})
export default class RecyclingCard extends Vue {

  @Prop(Object)
  recycling: Recycling

  @Prop({type: Boolean, default: false})
  titleLocation: boolean

}
</script>