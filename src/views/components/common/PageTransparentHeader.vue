<template>
  <div>
    <div :class="isScrolled ? 'scrolled' : ''">
      <slot></slot>
    </div>
  </div>
</template>
<script lang=ts>
import {Style} from '@capacitor/status-bar'
import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'
import { nativeProvider } from '@/providers/native/native.provider'

@Component({
  name: 'page-transparent-header'
})
export default class PageTransparentHeader extends Vue {

  @Prop(Boolean)
  transparent: boolean

  isScrolled = false

  scrolled(event) {
    const wasScrolled = this.isScrolled
    this.isScrolled = event.detail.scrollTop > 0
    if (this.isScrolled !== wasScrolled && this.transparent) {
      if (this.transparent && this.isScrolled) {
        nativeProvider.setStatusBarStyle(Style.Light)
      } else {
        nativeProvider.setStatusBarStyle(Style.Dark)
      }
    }
  }

  mounted() {
    if (this.transparent) {
      nativeProvider.setStatusBarStyle(Style.Dark)
    }
  }

  beforeDestroy() {
    if (this.transparent) {
      nativeProvider.setStatusBarStyle(Style.Light)
    }
  }
}
</script>
<style scoped>

</style>
