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
                    color="black"></ion-icon>
          <ion-label>{{ $t('group-profile') }}</ion-label>
        </ion-item>

        <ion-item button @click="$router.push(`/group/${id}/settings/requests`)">
          <ion-icon slot="start" :src="require('ionicons5/dist/svg/person-add-outline.svg')"
                    color="black"></ion-icon>
          <ion-label>{{ $t('group-requests') }}</ion-label>
          <ion-badge color="danger" slot="end" v-if="requests">
            {{ requests }}
          </ion-badge>
        </ion-item>

        <ion-item button @click="$router.push(`/group/${id}/settings/questions`)">
          <ion-icon slot="start" :src="require('ionicons5/dist/svg/help-circle-outline.svg')"
                    color="black"></ion-icon>
          <ion-label>{{ $t('group-questions') }}</ion-label>
        </ion-item>

        <ion-item button @click="$router.push(`/group/${id}/settings/report`)">
          <ion-icon slot="start" :src="require('ionicons5/dist/svg/download-outline.svg')"
                    color="black"></ion-icon>
          <ion-label>{{ $t('download-report') }}</ion-label>
        </ion-item>
      </ion-list>

      <ion-list v-if="isRecyclingGroup">
        <ion-list-header>
          <ion-label>{{ $t('recycling') }}</ion-label>
        </ion-list-header>

        <ion-item button @click="$router.push(`/group/${id}/settings/recycling-stations`)">
          <ion-icon slot="start" icon="trash-outline" :src="require('ionicons5/dist/svg/location-outline.svg')"
                    color="black"/>
          <ion-label>{{ $t('stations') }}</ion-label>
        </ion-item>

        <ion-item button @click="$router.push(`/group/${id}/settings/recycling-station-models`)">
          <ion-icon slot="start" icon="trash-outline" :src="require('ionicons5/dist/svg/trash-outline.svg')"
                    color="black" />
          <ion-label>{{ $t('station-models') }}</ion-label>
        </ion-item>
      </ion-list>

    </ion-content>
  </ion-page>
</template>
<script lang="ts">
import {Component, Vue} from 'vue-property-decorator'
import {groupsModule} from '@/store/groupsModule'
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

  get currentGroup() {
    return groupsModule.getCurrentGroup
  }

  get isRecyclingGroup() {
    return this.currentGroup?.capabilities.some((capability) => capability.startsWith('RECYCLING'))
  }

  get requests() {
    return groupsModule.groupHasRequests[this.id]
  }

  mounted() {
    this.id = +this.$route.params.id
    groupsModule.fetchGroupHasRequests(this.id)
    if (!groupsModule.getCurrentGroup) {
      groupsModule.fetchGroup(this.id)
    }
  }

}
</script>