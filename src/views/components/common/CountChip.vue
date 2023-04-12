<template>
  <ion-chip :color="color" mode="ios" :class="{'text-xs h-7': !large, 'text-sm': large}">
    <ion-icon :src="icon" class="-ml-1 mr-2" :class="{'text-sm': !large, 'text-base': large}"/>
    <div style="line-height: 0.75rem">{{ value }} {{ $tc(type + '-p', count) }}</div>
  </ion-chip>
</template>
<script lang="ts">
import Component from 'vue-class-component'
import Vue from 'vue'
import {Prop} from 'vue-property-decorator'
import language from '@/tools/language'
import millify from 'millify'

@Component({
  name: 'count-chip'
})
export default class CountChip extends Vue {

  @Prop()
  count: number | string

  @Prop()
  type: 'cleanups' | 'liters' | 'kilos' | 'users'

  @Prop(Boolean)
  large: boolean

  @Prop({type: String, default: 'secondary'})
  color: string

  get localizedSeparator() {
    return (1.1).toLocaleString(this.$i18n.locale)[1]
  }

  get value() {
    return this.count < 1000 ? this.count : millify(Number(this.count), {decimalSeparator: this.localizedSeparator})
  }

  get icon(): string {
    switch (this.type) {
      case 'cleanups':
        return require('ionicons5/dist/svg/trash.svg')
      case 'liters':
        return require('@/assets/img/icons/bag.svg')
      case 'kilos':
        return require('@/assets/img/icons/scale.svg')
      case 'users':
        return require('ionicons5/dist/svg/person.svg')
    }
  }

}
</script>