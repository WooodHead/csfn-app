<template>
  <div>
    <ion-header mode="ios">
      <ion-toolbar mode="ios">
        <ion-buttons slot="start">
          <ion-button @click="close">
            <ion-icon slot="icon-only" color="dark" name="arrow-back"/>
          </ion-button>
        </ion-buttons>

        <ion-title>
          {{ title }}
        </ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-list lines="full">
        <ion-item v-for="(user, i) in participants" :key="i">
          <ion-avatar slot="start">
            <img :src="user && user.picture && user.picture.publicUrl || '/img/user-placeholder.png'">
          </ion-avatar>
          <ion-label class="mr-2 font-bold ios:my-4">{{user && user.username || 'Anonymous' }}</ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  </div>
</template>
<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator'
import User from '@/types/User'
import {i18n} from '@/i18n'

@Component({name: 'CleanersListModal'})
export default class CleanersListModal extends Vue {

  @Prop()
  title: string


  @Prop()
  participants: User[]

  close() {
    this.$ionic.modalController.dismiss()
  }
}
</script>