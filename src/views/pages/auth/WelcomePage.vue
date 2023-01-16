<template>
  <ion-page class="ion-page">
    <ion-header mode="ios">
      <ion-toolbar class="economica text-center text-xl" mode="ios">
        Clean something for nothing
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-slides ref="slider" :pager="true" class="h-full welcome-slider" mode="ios"
                  @ionSlideTransitionStart="slideChange">
        <ion-slide v-for="i of 3" :key="i">
          <div class="flex flex-col justify-between items-center md:space-y-8 h-full pt-4 pb-10 md:py-20">
            <div class="relative flex items-center justify-center w-3/4 h-24 md:h-32">
              <div class="absolute">
                <span class="text-white font-bold text-2xl">{{$t(`slide-${i}-title`)}}</span>
              </div>
              <img :src="require('@/assets/img/welcome/bubble-' + i + '.png')" class="w-full" style="width: 100%"/>
            </div>
            <div class="w-3/4">
              <img :src="require('@/assets/img/welcome/pine-' + i + '.png')"/>
            </div>
            <div>
              <ul class="text-left  list-disc pl-6 space-y-2">
                <li v-for="(point, i) in $t(`slide-${i}-points`).split(',')" :key="i" class="font-bold text-xl">{{ point}}</li>
              </ul>
            </div>
          </div>
        </ion-slide>
      </ion-slides>
    </ion-content>
  </ion-page>
</template>
<script lang="ts">
import {Component, Vue} from 'vue-property-decorator'

@Component({
  name: 'welcome-page'
})
export default class WelcomePage extends Vue {

  isEnd = false

  slideChange() {
    (this.$refs['slider'] as HTMLIonSlidesElement).isEnd()
        .then((end) => {
          if (this.isEnd && end) {
            this.$router.replace('/home')
          }
          this.isEnd = end
        })
  }

}
</script>
<style scoped>
.welcome-slider {
  --bullet-background: #222222 !important;
  --bullet-background-active: #999 !important;
}
</style>
