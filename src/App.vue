<template>
  <div :class="{'notch': hasNotch}">
    <ion-app>
      <ion-vue-router mode="md"/>
    </ion-app>
    <div id="empty"/>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import CurrentUserPage from '@/views/pages/home/user/CurrentUserPage.vue'
import EventsPage from '@/views/pages/home/events/EventsPage.vue'
import CommunityPage from '@/views/pages/home/community/CommunityPage.vue'
import {hasNotch} from '@/tools/Utils'

@Component({
  components: {CurrentUserPage, EventsPage, CommunityPage}
})
export default class Main extends Vue {

  hasNotch = false

  mounted() {
    setTimeout(() => {
      this.hasNotch = hasNotch()
    }, 3000)
  }

}
</script>
<style lang="scss">
@import 'assets/style/main.scss';
</style>
