<template>
  <ion-page>
    <ion-header mode="ios">
      <ion-toolbar mode="ios">
        <ion-buttons slot="start">
          <ion-button fill="clear" shape="round" @click="$router.back()">
            <ion-icon name="arrow-back" color="dark"></ion-icon>
          </ion-button>
        </ion-buttons>

        <ion-title>{{ $t('station-models') }}</ion-title>

        <ion-buttons slot="end">
          <ion-button fill="clear" shape="round" @click="$router.push('/group/' + id + '/settings/recycling-station-models/new')">
            <ion-icon :src="require('ionicons5/dist/svg/add-circle-outline.svg')" color="dark"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="list-large-items">
      <ion-list>
        <empty-text v-if="!loading && !models.length" :text="$t('no-station-models')"/>
        <ion-item v-for="model in models" :key="model.id" button @click="$router.push('/group/' + id + '/settings/recycling-station-models/' + model.id)">
          <div slot="start" class="flex items-center justify-center w-10 h-10 rounded-full" :style="`background-color: ` + model.types[0].color">
            <fa-icon :icon="model.types[0].icon" class="-mt-1"/>
          </div>
          <ion-label>
            {{model.name}}
          </ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>
<script lang="ts">
import {Component, Vue} from 'vue-property-decorator'
import {groupRecyclingModule} from '@/store/groupRecyclingModule'
import EmptyText from '@/views/components/common/EmptyText.vue'

@Component({
  name: 'station-models-page',
  components: {EmptyText}
})
export default class StationModelsPage extends Vue {

  id: number = null
  loading: boolean = false

  get models() {
    return groupRecyclingModule.currentGroupStationModels
  }

  mounted() {
    this.loading = true
    this.id = +this.$route.params.id
    groupRecyclingModule.fetchCurrentGroupStationModels(this.id)
        .then(() => this.loading = false)
  }

}
</script>