<template>
  <ion-page class="cleanups-map">
    <ion-header class="z-50" mode="ios">
      <ion-toolbar class="pb-2 flex items-center pr-6" mode="ios" @keyup.enter="search">
        <ion-buttons slot="start" class="mt-3">
          <ion-button @click="$router.back()">
            <ion-icon slot="icon-only" color="dark" name="arrow-back"/>
          </ion-button>
        </ion-buttons>
        <text-item v-model="searchText" :clear="true" :outline="true" :placeholder="$t('search-place')"
                   :rounded="true" ref="text-input"
                   class="mt-2" icon="search" type="search" onBlur="clear" @cleared="clear"></text-item>
      </ion-toolbar>
      <ion-progress-bar v-if="loading" color="primary" type="indeterminate"></ion-progress-bar>
    </ion-header>
    <ion-content>
      <ion-card class="top-0 w-full absolute z-40 m-0 rounded-none">
        <selection-list :element-value="location => addressToString(location.address)" :elements="searchResults"
                        element-key="id"
                        icon="location-sharp"
                        @selected="selectedSearch">
        </selection-list>
      </ion-card>

      <div id="map_canvas" class="h-full w-full z-30"></div>
      <transition name="fade-up">
        <div v-if="selectedCleanup"
             class="absolute bottom-0 w-full flex justify-center md:justify-start lg:w-2/3 xl:w-1/2 lg:p-4"
             style="z-index: 1000">
          <div class="w-full z-50 ">
            <cleanup-card :cleanup="cleanup" @click="openSelectedCleanup"></cleanup-card>
          </div>
        </div>
      </transition>
    </ion-content>
  </ion-page>
</template>
<script lang=ts>
import {placesProvider} from '@/providers/places/places.provider'
import {cleanupsModule} from '@/store/cleanupsModule'
import {locationModule} from '@/store/locationModule'
import ErrorMessage from '@/tools/ErrorMessage'
import Map from '@/tools/Map'
import ToastPresenter from '@/tools/ToastPresenter'
import {addressToString} from '@/tools/Utils'
import Cleanup from '@/types/Cleanup'
import Location from '@/types/Location'
import InputItem from '@/views/components/common/InputItem.vue'
import SelectionList from '@/views/components/common/SelectionList.vue'
import CleanupCard from '@/views/components/common/CleanupCard.vue'
import _, {debounce} from 'lodash'
import Vue from 'vue'
import Component from 'vue-class-component'
import {Watch} from 'vue-property-decorator'

@Component({
  name: 'map-modal',
  components: {SelectionList, TextItem: InputItem, CleanupCard}
})
export default class MapModal extends Vue {

  loading = false
  searchText = ''
  searchResults: Location[] = []
  selectedResult: Location
  selectedCleanup = 0
  map: Map

  get cleanups() {
    return cleanupsModule.getMarkers
  }

  get cleanup() {
    return cleanupsModule.getCleanup
  }

  mounted() {
    const selected = cleanupsModule.getCleanup
    setTimeout(() => {
      this.map = new Map({
        pin: 'img/pin_cleanup.png',
        element: 'map_canvas',
        origin: selected?.location.coords || locationModule.getCoords,
        bounds: cleanupsModule.getOpenedMap?.bounds,
        zoom: cleanupsModule.getOpenedMap?.zoom,
        isInput: false,
        onTouch: () => this.touched()
      })
      cleanupsModule.setOpenedMap(null)
      this.fetch()
      if (selected) {
        setTimeout(() => {
          this.selectCleanup(selected)
        }, 100)
      }
    })
  }

  touched() {
    (this.$refs['text-input'] as HTMLInputElement).blur()
    this.searchResults = []
    this.selectedCleanup = 0
    cleanupsModule.setCleanup(null)
    debounce(() => {
      this.fetch()
    }, 100)()
  }

  fetch() {
    this.loading = true
    cleanupsModule.fetchMarkers(this.map.getBounds())
  }

  @Watch('cleanups')
  cleanupsChanged(cleanups: Cleanup[], previousCleanups: Cleanup []) {
    this.loading = false

    const removed: string[] = _.differenceBy(previousCleanups, cleanups, 'id').map(({id}) => 'c' + id)
    const added: Cleanup[] = _.differenceBy(cleanups, previousCleanups, 'id')

    this.map.removeMarkersById(removed)
    for (const cleanup of added) {
      this.map.addMarker(cleanup.location.coords,
          '/img/pin_cleanup.png',
          () => this.selectCleanup(cleanup),
          'c' + cleanup.id)
    }
  }

  selectCleanup(cleanup: Cleanup) {
    //this.map.moveCamera({ lat: cleanup.location.coords.lat - 0.01, lng: cleanup.location.coords.lng })
    cleanupsModule.fetchCleanup(cleanup.id)
    this.selectedCleanup = cleanup.id
  }

  openSelectedCleanup() {
    cleanupsModule.setOpenedMap(this.map)
    this.$router.push('/cleanup/' + this.selectedCleanup)
  }

  search() {
    this.loading = true
    placesProvider.searchPlace(this.searchText, locationModule.getAddress.countryCode)
        .then((results) => {
          this.loading = false
          this.searchResults = results
        })
        .catch((error) => {
          this.loading = false
          ToastPresenter.present(this.$ionic, ErrorMessage.getMessage(error))
        })
  }

  clear() {
    setTimeout(() => {
      this.searchResults = []
    }, 300)
  }

  selectedSearch(selected: Location) {
    this.searchText = ''
    this.selectedResult = selected
    this.map.moveCamera(selected.coords, 10)
  }

  addressToString(address) {
    return addressToString(address)
  }

}
</script>
