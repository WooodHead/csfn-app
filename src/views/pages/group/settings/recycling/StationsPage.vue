<template>
  <ion-page>
    <ion-header mode="ios">
      <ion-toolbar mode="ios">
        <ion-buttons slot="start">
          <ion-button fill="clear" shape="round" @click="$router.back()">
            <ion-icon name="arrow-back" color="dark"></ion-icon>
          </ion-button>
        </ion-buttons>

        <ion-title>{{ $t('stations') }}</ion-title>

        <ion-buttons slot="end">
          <ion-button fill="clear" shape="round"
                      @click="$router.push('/group/' + id + '/settings/recycling-stations/new')">
            <ion-icon :src="require('ionicons5/dist/svg/add-circle-outline.svg')" color="dark"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="list-large-items">
      <ion-list>
        <empty-text v-if="!loading && !stations.length" :text="$t('no-stations')"/>
        <ion-item v-for="station in stations" :key="station.id" button
                  @click="$router.push('/recycling-stations/' + station.id)">
          <ion-thumbnail slot="start">
            <img :src="station.pictures[0].publicUrl" class="w-full h-full object-cover"/>
          </ion-thumbnail>
          <ion-label class="space-y-1">
            <h2><b>{{ station.name }}</b></h2>
            <p>
              <ion-icon icon="location-sharp"></ion-icon>
              {{ station.location.address.street }}, {{ station.location.address.city }}
            </p>
          </ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>
<script lang="ts">
import {Component, Vue} from 'vue-property-decorator'
import EmptyText from '@/views/components/common/EmptyText.vue'
import {groupRecyclingModule} from '@/store/groupRecyclingModule'

@Component({
  name: 'stations-page',
  components: {EmptyText}
})
export default class StationsPage extends Vue {

  id: number = null
  loading: boolean = false

  get stations() {
    return groupRecyclingModule.currentGroupStations
  }

  mounted() {
    this.loading = true
    this.id = +this.$route.params.id
    groupRecyclingModule.fetchCurrentGroupStations(this.id)
        .then(() => this.loading = false)
  }

}
</script>