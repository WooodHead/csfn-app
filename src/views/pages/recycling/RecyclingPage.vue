<template>
  <page-transparent-header ref="page" :transparent="true">
    <ion-page class="ion-page">
      <transparent-header>
        <template slot="end-buttons">

          <ion-button v-if="canEdit" fill="clear" shape="round"
                      @click="$router.push('/edit-recycling?stationId=' + recycling.station.id)">
            <ion-icon name="pencil-sharp"></ion-icon>
          </ion-button>
        </template>
      </transparent-header>

      <ion-content ref="cleanup-content" :scroll-events="true" class="fullscreen" color="lighter" @ionScroll="onScroll">
        <div class="m-auto bg-white overflow-hidden">

          <!-- Pictures -->
          <div class="cleanup-page__picture h-2/3 cursor-pointer">
            <transition name="fade">
              <ion-slides v-if="recycling" class="absolute h-full w-full visible" :pager="true">
                <ion-slide v-for="(picture, i) in recycling.pictures" :key="i" @click="openPictures(i)">
                  <img :src="picture.publicUrl" alt="Cleanup picture">
                </ion-slide>
              </ion-slides>
              <ion-skeleton-text v-else animated class="absolute w-full h-full m-0"></ion-skeleton-text>
            </transition>
          </div>

          <transition name="fade">
            <div v-if="recycling">
              <div class="pt-4 px-4 lg:px-24">
                <!-- Title -->
                <ion-label class="text-xl font-bold">
                  {{ title }}
                </ion-label>
              </div>
              <!-- Chips -->
              <div class="my-2 whitespace-nowrap overflow-x-auto w-full px-4 lg:px-24">
                <ion-chip v-for="item in recycling.items" :key="item.id" color="blue" class="pt-2 ml-0">
                  <fa-icon :icon="item.type.icon" class="-ml-1 mr-2 -mt-1"/>
                  <ion-label>{{ item.count }} {{ item.type.name }}</ion-label>
                </ion-chip>
                <count-chip :count="recycling.volume" type="liters" large color="blue"/>
                <count-chip :count="recycling.weight" type="kilos" large color="blue"/>
              </div>
              <div class="pb-4 px-4 lg:px-24">

                <!-- Description -->
                <ion-text>{{ recycling.description }}</ion-text>


                <div class="flex justify-between items-center mt-4">
                  <user-chip :user="recycling.user"/>

                  <ion-label class="text-sm" color="dark">
                    {{ formattedDate }}
                  </ion-label>
                </div>

              </div>

              <hr class="mx-4">
              <div class="px-4 py-4 lg:px-24">
                <!-- Location -->
                <div class="flex items-center mb-4 ion-activatable relative overflow-hidden"
                     @click="$router.push('/recycling-stations/' + recycling.station.id)">
                  <ion-icon class="mr-3 text-3xl" color="blue" name="location-sharp"></ion-icon>
                  <ion-label class="font-bold ion-text-wrap">
                    <span class="text-base">{{ recycling.station.location.address.street }}</span><br>
                    <span class="text-base">{{ recycling.station.location.address.city }}</span><br>
                    <span class="text-base">{{ recycling.station.location.address.country }}</span>
                  </ion-label>
                  <ion-ripple-effect/>
                </div>

                <!-- Map -->
                <div class="h-2/3 mt-2 rounded-md w-full map-wrapper overflow-hidden ripple-parent cursor-pointer">
                  <img v-if="width" :src="`https://maps.googleapis.com/maps/api/staticmap?key=${KEY}`
                                + `&markers=icon:https://storage.googleapis.com/csfn-public-assets/pin_${recycling.items[0].type.id}.png`
                                + `|${recycling.station.location.coords.lat},${recycling.station.location.coords.lng}`
                                + `&zoom=11&size=${width}x${Math.ceil(width * 2 / 3)}`" class="absolute w-full h-full">
                  <ion-ripple-effect></ion-ripple-effect>
                </div>
              </div>
            </div>
            <div v-else class="ion-padding">
              <ion-skeleton-text animated></ion-skeleton-text>
              <div class="flex mt-3">
                <ion-skeleton-text animated class="w-1/3 rounded-full"></ion-skeleton-text>
                <ion-skeleton-text animated class="w-1/3 rounded-full ml-3"></ion-skeleton-text>
              </div>
              <ion-skeleton-text animated class="mt-3"></ion-skeleton-text>
              <ion-skeleton-text animated class="mt-3"></ion-skeleton-text>
              <ion-skeleton-text animated class="mt-3"></ion-skeleton-text>
              <div class="flex justify-between mt-3">
                <ion-skeleton-text animated class="w-1/3 rounded-full"></ion-skeleton-text>
                <ion-skeleton-text animated class="w-1/3 rounded-full"></ion-skeleton-text>
              </div>
              <hr class="my-4">
              <ion-skeleton-text animated></ion-skeleton-text>
              <ion-skeleton-text animated class="h-2/3 mt-3"></ion-skeleton-text>
            </div>
          </transition>
        </div>
      </ion-content>
    </ion-page>
  </page-transparent-header>
</template>
<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import {userModule} from '@/store/userModule'
import User from '@/types/User'
import ModalPresenter from '@/tools/ModalPresenter'
import moment from 'moment'
import PicturesModal from '@/views/modals/PicturesModal.vue'
import TransparentHeader from '@/views/components/common/TransparentHeader.vue'
import {Ref} from 'vue-property-decorator'
import PageTransparentHeader from '@/views/components/common/PageTransparentHeader.vue'
import Image from '@/types/Image'
import {addressToString, remToPixel} from '@/tools/Utils'
import CountChip from '@/views/components/common/CountChip.vue'
import UserChip from '@/views/components/common/UserChip.vue'
import {recyclingModule} from '@/store/recyclingModule'
import Recycling from '@/types/Recycling'

@Component({
  name: 'recycling-page',
  components: {UserChip, PageTransparentHeader, TransparentHeader, CountChip}
})
export default class RecyclingPage extends Vue {

  KEY = process.env.VUE_APP_GOOGLE_API_KEY

  width = 0
  isAdmin = false
  invisibleUsers = 0
  invisibleGroups = 0
  pendingTagRequest = null

  @Ref('activity-content')
  content: HTMLIonContentElement

  get isSmall() {
    return window.innerWidth < 600
  }

  get recycling(): Recycling {
    return recyclingModule.recycling
  }

  get title(): string {
    return this.$t('recycling-in', [this.recycling.station.location.address.city]).toString()
  }

  get currentUser(): User {
    return userModule.getCurrentUser
  }

  get formattedDate() {
    return this.recycling && moment(this.recycling.date).format('D MMMM YYYY')
  }

  get addressString() {
    return addressToString(this.recycling.station.location.address)
  }

  get canEdit() {
    return this.recycling?.user?.id === userModule.getCurrentUser.id
  }

  mounted() {
    recyclingModule.setRecycling(null)
    recyclingModule.fetchRecycling(+this.$route.params.id)
    setTimeout(() => {
      this.width = Math.round(window.innerWidth < 600 ? window.innerWidth : window.innerWidth - remToPixel(12))
    })
  }

  openPictures(selected) {
    ModalPresenter.present(this.$ionic, PicturesModal, {
      pictures: (this.recycling.pictures as Image[]).map(({publicUrl}) => publicUrl),
      selected
    })
  }

  onScroll(event) {
    (this.$refs['page'] as any).scrolled(event)
  }

}
</script>
<style>
.cleanup-page__picture {
  background-color: var(--ion-color-light);
}

.cleanup-page__picture img {
  object-fit: cover;
  object-position: center center;
  width: 100%;
}

ion-item.pl-0 {
  --padding-start: 0;
}

.map-wrapper {
  background-color: var(--ion-color-light);
}

.map-wrapper > img {
  object-fit: cover;
  object-position: center center;
}


.chips-list::after {
  content: '';
  position: absolute;
  right: 0;
  width: 50px;
  height: 100%;
  background: transparent;
  transition: background 0.3s;
}

.chips-overflow::after {
  background: linear-gradient(90deg, transparent, white 25%);
}

.invisible-count {
  position: absolute;
  top: 0;
  height: 100%;
  display: flex;
  align-items: center;
  right: 0;
  z-index: 10;
  overflow: visible;
}
</style>
