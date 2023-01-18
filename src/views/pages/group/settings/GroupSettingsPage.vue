<template>
  <ion-page>
    <ion-header mode="ios">
      <ion-toolbar mode="ios">
        <ion-buttons slot="start">
          <ion-button fill="clear" shape="round" @click="$router.back()">
            <ion-icon name="arrow-back" color="dark"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>{{ $t('group-settings') }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="list-large-items">
      <ion-list>
        <ion-item button @click="$router.push(`/group/${id}/settings/profile`)">
          <ion-icon slot="start" :src="require('ionicons5/dist/svg/brush-outline.svg')"
                    color="back"></ion-icon>
          <ion-label>{{ $t('group-profile') }}</ion-label>
        </ion-item>

        <ion-item button @click="$router.push(`/group/${id}/settings/requests`)">
          <ion-icon slot="start" :src="require('ionicons5/dist/svg/person-add-outline.svg')"
                    color="back"></ion-icon>
          <ion-label>{{ $t('group-requests') }}</ion-label>
          <ion-badge color="danger" slot="end" v-if="requests">
            {{ requests }}
          </ion-badge>
        </ion-item>

        <ion-item button @click="$router.push(`/group/${id}/settings/questions`)">
          <ion-icon slot="start" :src="require('ionicons5/dist/svg/help-circle-outline.svg')"
                    color="back"></ion-icon>
          <ion-label>{{ $t('group-questions') }}</ion-label>
        </ion-item>

        <ion-item button @click="$router.push(`/group/${id}/settings/report`)">
          <ion-icon slot="start" :src="require('ionicons5/dist/svg/download-outline.svg')"
                    color="back"></ion-icon>
          <ion-label>{{ $t('download-report') }}</ion-label>
        </ion-item>
      </ion-list>

    </ion-content>
  </ion-page>
</template>
<script lang="ts">
import {Component, Vue} from 'vue-property-decorator'
import {groupsModule} from '@/store/groupsModule'
import {Keyboard, KeyboardInfo} from '@capacitor/keyboard'
import {height} from 'tailwindcss/lib/plugins'

@Component({
  name: 'GroupSettingsPage',
  methods: {
    height() {
      return height
    }
  }
})
export default class GroupSettingsPage extends Vue {

  id: number = null

  get requests() {
    return groupsModule.groupHasRequests[this.id]
  }

  mounted() {
    this.id = +this.$route.params.id
    groupsModule.fetchGroupHasRequests(this.id)
  }


}
</script>