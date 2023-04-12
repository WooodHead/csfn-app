<template>
  <page-transparent-header ref="page" :transparent="true">
    <ion-page class="ion-page">
      <transparent-header>
        <template slot="end-buttons">

          <ion-button v-if="canEdit" fill="clear" shape="round"
                      @click="generateQR">
            <ion-icon :src="require('ionicons5/dist/svg/qr-code-outline.svg')"></ion-icon>
          </ion-button>

          <ion-button v-if="canEdit" fill="clear" shape="round"
                      @click="$router.push(editLink)">
            <ion-icon name="pencil-sharp"></ion-icon>
          </ion-button>

        </template>
      </transparent-header>

      <ion-content ref="station-content" :scroll-events="true" class="fullscreen" color="lighter" @ionScroll="onScroll">
        <div class="m-auto bg-white overflow-hidden shadow-md">

          <!-- Pictures -->
          <div class="station-page__picture h-2/3 cursor-pointer">
            <transition name="fade">
              <ion-slides v-if="station" class="absolute h-full w-full visible" :pager="true">
                <ion-slide v-for="(picture, i) in station.pictures" :key="i" @click="openPictures(i)">
                  <img :src="picture.publicUrl" alt="Station picture" class="w-full object-cover"
                       style="width: 100% !important; object-fit: cover;">
                </ion-slide>
              </ion-slides>
              <ion-skeleton-text v-else animated class="absolute w-full h-full m-0"></ion-skeleton-text>
            </transition>
          </div>

          <div v-if="station">
            <div class="py-4 px-4 lg:px-24">
              <ion-label class="text-xs uppercase font-bold opacity-50">
                {{ $t('recycling-station') }}
              </ion-label>
              <br>
              <!-- Title -->
              <ion-label class="text-xl font-bold">
                {{ station.name }}
              </ion-label>

              <div class="flex justify-around w-full mt-2" v-if="station">
                <stats-counter :icon-src="require('ionicons5/dist/svg/trash-outline.svg')" :label="type.name"
                               :max="1" progress-value="1" :key="'cleanups' + 0"
                               :value="typeCount(type.id)" no-animate :colors="['#426eff', '#426eff']">
                  <template slot="icon">
                    <fa-icon :icon="type.icon" class="text-sm -mt-1"/>
                  </template>
                </stats-counter>

                <stats-counter :icon-src="require('@/assets/img/icons/bag-outline.svg')"
                               progress-value="1" :label="$t('liters')" :max="1"
                               :value="station.stats.totalVolume" :key="'volume-'+ station.stats.totalVolume"
                               no-animate :colors="['#426eff', '#426eff']"/>

                <stats-counter :icon-src="require('@/assets/img/icons/scale-outline.svg')"
                               progress-value="1" :label="$t('kilos')" :max="1"
                               :value="station.stats.totalWeight" :key="'weight-' + station.stats.totalWeight"
                               no-animate :colors="['#426eff', '#426eff']"/>
              </div>

              <!-- Description -->
              <!--<ion-text>{{ station.description }}</ion-text>-->

              <ion-button shape="round" class="w-full" color="blue" v-if="!station.removed"
                          @click="$router.push('/edit-recycling?stationId=' + station.id)">
                {{ $t('publish-recycling') }}
              </ion-button>

              <ion-button color="dark" disabled v-else class="w-full" shape="round" mode="ios">
                {{ $t('station-not-available')}}
              </ion-button>
            </div>
            <ion-segment mode="md" :value="segment" @ionChange="segment = $event.target.value" color="blue" scrollable>
              <ion-segment-button mode="md" value="0">
                <div class="flex items-center w-full justify-center">
                  {{ $t('recyclings') }}
                  <ion-badge color="blue" class="ml-2">{{ totalRecyclings }}</ion-badge>
                </div>
              </ion-segment-button>
              <ion-segment-button mode="md" value="1">{{ $tc('users', 2) }}</ion-segment-button>
              <ion-segment-button mode="md" value="2">{{ $t('info') }}</ion-segment-button>
            </ion-segment>
          </div>


        </div>

        <div class="relative">
          <transition :name="`slide-${slideDirection}`">
            <div v-if="segment === '0'" class="station-tab-content absolute top-0 w-full" key="recycling">
              <empty-text v-if="!recyclings.length" :text="$t('no-recyclings-yet')"/>

              <recycling-card v-for="recycling in recyclings" :key="recycling.id" :recycling="recycling"/>

              <ion-infinite-scroll @ionInfinite="nextRecyclings" :disabled="!hasMoreRecyclings"
                                   :key="'i' + hasMoreRecyclings">
                <ion-infinite-scroll-content/>
              </ion-infinite-scroll>
            </div>
            <div v-else-if="segment === '1'" class="station-tab-content absolute top-0 w-full" key="users">
              <empty-text v-if="!users.length" :text="$t('no-users-yet')"/>

              <ion-card v-for="user in users" :key="user.user.id" mode="ios" class="p-2 m-3">
                <div class="flex items-center pl-2">
                  <ion-avatar class="w-6 h-6">
                    <img :src="user.user.picture.publicUrl"/>
                  </ion-avatar>
                  <span class="font-bold text-black pl-2">{{ user.user.username }}</span>
                </div>

                <div class="recycling-card-chips mt-1" v-for="item in user.types" :key="item.id">
                  <ion-chip color="blue" class="pt-3">
                    <fa-icon :icon="item.type.icon" class="-ml-1 mr-2 -mt-1"/>
                    <ion-label>{{ item.count }} {{ item.type.name }}</ion-label>
                  </ion-chip>
                  <br>
                  <count-chip :count="item.volume" type="liters" large color="blue"/>
                  <count-chip :count="item.weight" type="kilos" large color="blue"/>
                </div>

              </ion-card>

              <ion-infinite-scroll @ionInfinite="nextUsers" :disabled="!hasMoreUsers"
                                   :key="'i' + hasMoreUsers">
                <ion-infinite-scroll-content/>
              </ion-infinite-scroll>
            </div>
            <div v-else-if="segment === '2'" class="station-tab-content absolute top-0 w-full" key="info">
              <ion-card mode="ios">
                <ion-item>
                  <ion-label class="ion-text-wrap max-w-full">
                    <span class="font-bold text-sm">{{ $t('description') }}</span>
                    <p>{{ station.description }}</p>
                  </ion-label>
                </ion-item>

                <ion-item @click="$router.push('/group/' + station.owner.id)" button>
                  <ion-avatar class="mr-2">
                    <img :src="station.owner.picture.publicUrl"/>
                  </ion-avatar>
                  <ion-label>
                    <span class="text-xs">{{ $t('owner') }}</span>
                    <h3><span class="font-bold">{{ station.owner.name }}</span></h3>
                  </ion-label>
                </ion-item>

                <ion-item v-if="station.distributor && station.distributor.id !== station.owner.id"
                          @click="$router.push('/group/' + station.distributor.id)" button>
                  <ion-avatar class="mr-2">
                    <img :src="station.distributor.picture.publicUrl"/>
                  </ion-avatar>
                  <ion-label>
                    <span class="text-xs">{{ $t('distributor') }}</span>
                    <h3><span class="font-bold">{{ station.distributor.name }}</span></h3>
                  </ion-label>
                </ion-item>

                <ion-item v-if="station.owner.id !== station.model.manufacturer.id"
                          @click="$router.push('/group/' + station.model.manufacturer.id)" button>
                  <ion-avatar class="mr-2">
                    <img :src="station.model.manufacturer.picture.publicUrl"/>
                  </ion-avatar>
                  <ion-label>
                    <span class="text-xs">{{ $t('manufacturer') }}</span>
                    <h3><span class="font-bold">{{ station.model.manufacturer.name }}</span></h3>
                  </ion-label>
                </ion-item>

              </ion-card>
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
import PicturesModal from '@/views/modals/PicturesModal.vue'
import TransparentHeader from '@/views/components/common/TransparentHeader.vue'
import {Ref, Watch} from 'vue-property-decorator'
import PageTransparentHeader from '@/views/components/common/PageTransparentHeader.vue'
import Image from '@/types/Image'
import {addressToString} from '@/tools/Utils'
import CountChip from '@/views/components/common/CountChip.vue'
import {userProvider} from '@/providers/data/user.provider'
import {GroupStatus} from '@/types/GroupStatus'
import UserChip from '@/views/components/common/UserChip.vue'
import RecyclingStation from '@/types/RecyclingStation'
import {recyclingModule} from '@/store/recyclingModule'
import RecyclingType, {RecyclingTypeId} from '@/types/RecyclingType'
import StatsCounter from '../../components/user/StatsCounter.vue'
import _ from 'lodash'
import {recyclingsProvider} from '@/providers/data/recyclings.provider'
import Recycling from '@/types/Recycling'
import {recyclingStationsProvider} from '@/providers/data/recycling-stations.provider'
import {StationUser} from '@/types/StationUser'
import RecyclingCard from '@/views/components/common/RecyclingCard.vue'
import EmptyText from '@/views/components/common/EmptyText.vue'
import RecyclingStationQR from '@/views/modals/RecyclingStationQR.vue'

@Component({
  name: 'recycling-station-page',
  components: {EmptyText, RecyclingCard, UserChip, PageTransparentHeader, TransparentHeader, CountChip, StatsCounter}
})
export default class RecyclingStationPage extends Vue {

  KEY = process.env.VUE_APP_GOOGLE_API_KEY

  segment = '0'
  width = 0
  isAdmin = false
  invisibleUsers = 0
  invisibleGroups = 0
  pendingTagRequest = null
  slideDirection = 'left'

  loadingRecyclings = false
  recyclingsPage = 1
  recyclings: Recycling[] = []
  hasMoreRecyclings = true
  totalRecyclings = 0

  loadingUsers = false
  usersPage = 1
  users: StationUser[] = []
  hasMoreUsers = true
  totalUsers = 0

  @Ref('activity-content')
  content: HTMLIonContentElement

  @Watch('segment')
  segmentChanged(newValue, oldValue) {
    this.slideDirection = newValue > oldValue ? 'left' : 'right'
  }

  get isSmall() {
    return window.innerWidth < 600
  }

  get station(): RecyclingStation {
    return recyclingModule.station
  }

  get currentUser(): User {
    return userModule.getCurrentUser
  }

  get addressString() {
    return addressToString(this.station.location.address)
  }

  get canEdit() {
    return this.isAdmin && !this.station.removed
  }

  get type(): RecyclingType {
    return this.station?.model.types[0] as RecyclingType
  }

  get editLink() {
    return '/group/' + this.station?.owner.id + '/settings/recycling-stations/' + this.station?.id
  }

  typeCount(type: RecyclingTypeId) {
    return _.find(this.station?.stats.types, {type})?.totalCount
  }

  mounted() {
    recyclingModule.setRecycling(null)
    recyclingModule.setStation(null)
    recyclingModule.fetchStation(Number(this.$route.params.id))
        .then(() => {
          if (!this.station) {
            this.$router.back()
          }
          this.fetchRecyclings()
          this.fetchUsers()
          userProvider.fetchUserGroupStatus(this.currentUser.id, this.station.owner.id)
              .then(({status}) => this.isAdmin = status === GroupStatus.ADMIN)
        })
  }

  openPictures(selected) {
    ModalPresenter.present(this.$ionic, PicturesModal, {
      pictures: (this.station.pictures as Image[]).map(({publicUrl}) => publicUrl),
      selected
    })
  }

  edit() {
    return
  }

  onScroll(event) {
    (this.$refs['page'] as any).scrolled(event)
  }

  fetchRecyclings() {
    this.loadingRecyclings = true
    return recyclingsProvider.findAll({page: this.recyclingsPage, stationId: this.station.id})
        .then(({data, meta}) => {
          this.totalRecyclings = meta.totalItems
          if (this.recyclings?.length) {
            this.recyclings.push(...data)
          } else {
            this.recyclings = data
          }
          if (meta?.totalItems === this.recyclings.length) {
            this.hasMoreRecyclings = false
          }
        })
        .finally(() => this.loadingRecyclings = false)
  }

  nextRecyclings(event) {
    this.recyclingsPage++
    this.fetchRecyclings()
        .finally(() => event.target.complete())
  }

  fetchUsers() {
    this.loadingUsers = true
    return recyclingStationsProvider.findUsers(this.station.id, this.usersPage)
        .then(({data, meta}) => {
          this.totalUsers = meta.totalItems
          if (this.users?.length) {
            this.users.push(...data)
          } else {
            this.users = data
          }
          if (meta?.totalItems === this.users.length) {
            this.hasMoreUsers = false
          }
        })
        .finally(() => this.loadingUsers = false)
  }

  nextUsers(event) {
    this.usersPage++
    this.fetchUsers()
        .finally(() => event.target.complete())
  }

  generateQR() {
    ModalPresenter.present(this.$ionic, RecyclingStationQR, {
      name: this.station.name,
      id: this.station.id,
      ionic: this.$ionic,
    })
  }

}
</script>
<style>
.station-page__picture {
  background-color: var(--ion-color-light);
}

.station1-page__picture img {
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

.recycling-card-chips ion-chip {
  height: 1.35rem;
  font-size: 0.85rem;
}

.station-tab-content {
  min-height: calc(100vh - 140px);
}
</style>
