<template>
  <div class="w-full h-full overflow-hidden" :style="{background: gradient}">
  </div>
</template>
<script lang="ts">
import Component from 'vue-class-component'
import Vue from 'vue'
import {Prop} from 'vue-property-decorator'
import extractColors from 'extract-colors'
import tinycolor from 'tinycolor2'

@Component({
  name: 'cover-placeholder'
})
export default class CoverPlaceholder extends Vue {

  @Prop()
  image: string

  colors: any[] = []

  get gradient() {
    return this.colors && `linear-gradient(-45deg, ${this.colors.join(',')})`
  }

  mounted() {
    extractColors(this.image, {
      crossOrigin: true,
      splitPower: 2,
    }).then((colors) => {
      this.colors = colors
          .map(({hex}) => hex)
          //.filter((hex) => colors.length < 2 || (hex !== '#ffffff' && hex !== '#000000'))
          .sort((a, b) => tinycolor(a).getBrightness() - tinycolor(b).getBrightness())
    })
  }

}
</script>