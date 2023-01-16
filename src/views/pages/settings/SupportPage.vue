<template>
  <ion-page>
    <ion-header mode="ios">
      <ion-toolbar mode="ios">
        <ion-buttons slot="start">
          <ion-button fill="clear" shape="round" @click="$router.back()">
            <ion-icon name="arrow-back" color="dark"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>
          <span class="flex items-center justify-center">
          <ion-icon :src="require('ionicons5/dist/svg/help-circle-outline.svg')" class="mr-2 -ml-2"></ion-icon>
          {{ $t('support') }}
          </span>
        </ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-list-header class="mt-2 px-4">
        {{ $t('support-message') }}
      </ion-list-header>
      <ion-list>
        <ion-item href="https://www.instagram.com/cleansomethingfornothing/" target="_blank">
          <ion-icon slot="start" :src="require('ionicons5/dist/svg/logo-instagram.svg')"></ion-icon>
          <ion-label>Instagram</ion-label>
        </ion-item>
        <ion-item href="https://www.facebook.com/Cleansomethingfornothing" target="_blank">
          <ion-icon slot="start" :src="require('ionicons5/dist/svg/logo-facebook.svg')"></ion-icon>
          <ion-label>Facebook</ion-label>
        </ion-item>
        <ion-item href="https://www.linkedin.com/company/cleansomethingfornothing/" target="_blank">
          <ion-icon slot="start" :src="require('ionicons5/dist/svg/logo-linkedin.svg')"></ion-icon>
          <ion-label>Linkedin</ion-label>
        </ion-item>
        <ion-item href="mailto:info@cleansomethingfornothing" target="_blank">
          <ion-icon slot="start" :src="require('ionicons5/dist/svg/mail-outline.svg')"></ion-icon>
          <ion-label>Email</ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>
<script>
import {Component, Vue} from 'vue-property-decorator'

@Component({
  name: 'SupportPage'
})
export default class SupportPage extends Vue {

}
</script>