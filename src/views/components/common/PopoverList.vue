<template>
  <ion-list class="p-0 bg-transparent m-0" lines="full">
    <ion-item v-for="item in items" :key="item.id" @click="click(item.onClick)" class="bg-transparent">
      <ion-icon :name="item.iconName" :src="item.iconSrc" v-if="item.iconName || item.iconSrc" slot="start"/>
      <ion-label><span class="text-sm">{{ item.label }}</span></ion-label>
    </ion-item>
  </ion-list>
</template>
<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator'
import {PopoverListItem} from '@/types/PopoverListItem'

@Component({
  name: 'popover-list'
})
export default class PopoverList extends Vue {

  @Prop()
  onDismiss: Function

  @Prop()
  items: PopoverListItem[]

  click(onClick: Function) {
    this.onDismiss()
    if(onClick) {
      onClick()
    }
  }

}
</script>