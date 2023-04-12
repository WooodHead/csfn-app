<template>
  <ion-card :style="`height: ${height-20}px`" button @click="$emit('click')" mode="ios">
    <img :src="src"
         :style="`height: ${height-20}px`"/>
  </ion-card>
</template>
<script lang=ts>
import Vue from 'vue'
import Component from 'vue-class-component'
import {Prop} from 'vue-property-decorator'
import Coords from '@/types/Coords'
import {remToPixel} from '@/tools/Utils'

@Component({
  name: 'community-map'
})
export default class CommunityMap extends Vue {
  KEY = process.env.VUE_APP_GOOGLE_API_KEY

  @Prop(Array)
  pins: Coords[]

  @Prop(Object)
  coords: Coords

  @Prop(String)
  pinType: string

  @Prop({type: Number, required: false})
  height: number

  width = 0

  get markers() {
    return this.pins?.length && encodeURI('icon:https://storage.googleapis.com/csfn-public-assets/pin_' + this.pinType + '.png|'
        + this.pins.map(({lat, lng}) => `${lat},${lng}`).join('|'))
  }

  get src() {
    return 'https://maps.googleapis.com/maps/api/staticmap' +
        `?size=${this.width}x${this.height || Math.ceil(this.width * 5 / 6)}&key=${this.KEY}` +
        '&style=feature:poi|element:labels.icon|visibility:off' +
        '&style=feature:road|element:labels.icon|visibility:off' +
        `&markers=${this.markers}` +
        (this.coords ? `&visible=${this.coords.lat},${this.coords.lng}` : '')
  }

  mounted() {
    this.width = Math.round(window.innerWidth < 600 ? window.innerWidth : window.innerWidth - remToPixel(12))
  }
}
</script>
<style scoped>

</style>
