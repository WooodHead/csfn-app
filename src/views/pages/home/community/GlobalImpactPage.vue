<template>
  <ion-page>
    <ion-header mode="ios">
      <ion-toolbar mode="ios" ref="toolbar">
        <ion-buttons slot="start">
          <ion-button shape="round" color="dark" fill="clear" @click="$router.back()">
            <ion-icon name="arrow-back"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title class="lg:text-lg xl:text-xl">{{ $t('world-map') }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-list lines="full">
        <ion-item v-for="country in getCountries" :key="country.country">
          <ion-avatar class="flex justify-center items-center bg-gray-200 text-lg" color="light" slot="start">
            {{ countryFlag(country) }}
          </ion-avatar>
          <ion-label>
            <p class="font-bold pl-2">{{ countryName(country) }}</p>
            <div class="ion-text-wrap">
              <count-chip v-if="country.cleanups !== '0'" :count="country.cleanups" type="cleanups"/>
              <count-chip v-if="country.volume" :count="country.volume" type="liters"/>
              <count-chip v-if="country.weight !== '0.00'" :count="country.weight" type="kilos"/>
              <count-chip v-if="country.users" :count="country.users" type="users"/>
            </div>
          </ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>
<script lang="ts">
import {Component, Vue} from 'vue-property-decorator'
import {statsModule} from '@/store/statsModule'
import {countries} from 'countries-list'
import * as _ from 'lodash'
import CountChip from '@/views/components/common/CountChip.vue'

@Component({
  name: 'global-impact-page',
  components: {CountChip}
})
export default class GlobalImpactPage extends Vue {

  get getCountries() {
    return _.sortBy(statsModule.getCountries, (country) => this.countryName(country))
  }

  mounted() {
    statsModule.fetchCountries()
  }

  countryFlag(country) {
    return countries[country.country].emoji
  }

  countryName(country) {
    return countries[country.country].name
  }
}
</script>
<style scoped>

</style>
