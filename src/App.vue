<template>
  <ion-app>
    <div :class="{'notch': hasNotch}">
      <transition mode="in-out" name="fade">
        <router-view></router-view>
      </transition>
    </div>
    <div id="empty"/>
  </ion-app>
</template>
<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import CurrentUserPage from '@/views/pages/home/user/CurrentUserPage.vue'
import EventsPage from '@/views/pages/home/events/EventsPage.vue'
import AlertsPage from '@/views/pages/home/alerts/AlertsPage.vue'
import CommunityPage from '@/views/pages/home/community/CommunityPage.vue'
import { hasNotch } from '@/tools/Utils'

@Component({
  components: { CurrentUserPage, EventsPage, AlertsPage, CommunityPage }
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
