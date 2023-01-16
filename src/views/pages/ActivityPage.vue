<template>
  <page-transparent-header ref="page" :transparent="true">
    <ion-page class="ion-page">
      <transparent-header>
        <template slot="end-buttons">

          <ion-button v-if="canEdit" fill="clear" shape="round"
                      @click="$router.push('/edit-cleanup')">
            <ion-icon name="pencil-sharp"></ion-icon>
          </ion-button>

          <ion-button v-if="moreMenu.length" fill="clear" shape="round"
                      @click="showMoreMenu">
            <ion-icon name="ellipsis-vertical"></ion-icon>
          </ion-button>
        </template>
      </transparent-header>

      <ion-content ref="cleanup-content" :scroll-events="true" class="fullscreen" color="lighter" @ionScroll="onScroll">
        <div class="m-auto bg-white overflow-hidden">

          <!-- Pictures -->
          <div class="cleanup-page__picture h-2/3 cursor-pointer">
            <transition name="fade">
              <ion-slides v-if="activity" class="absolute h-full w-full visible" :pager="true">
                <ion-slide v-for="(picture, i) in activity.pictures" :key="i" @click="openPictures(i)">
                  <img :src="picture.publicUrl" alt="Cleanup picture">
                </ion-slide>
              </ion-slides>
              <ion-skeleton-text v-else animated class="absolute w-full h-full m-0"></ion-skeleton-text>
            </transition>
          </div>

          <transition name="fade">
            <div v-if="activity">
              <div class="py-4 px-4 lg:px-24">
                <!-- Title -->
                <ion-label class="text-xl font-bold">
                  {{ title }}
                </ion-label>

                <!-- Chips -->
                <div class="my-2">
                  <count-chip :count="activity.volume" type="liters" large/>
                  <count-chip :count="activity.weight" type="kilos" large/>
                </div>

                <!-- Description -->
                <ion-text>{{ activity.description }}</ion-text>


                <div class="flex justify-between items-center mt-4">
                  <user-chip v-if="activity && activity.user && cleaners.length === 1" :user="activity.user"/>
                  <div v-else/>


                  <ion-label class="text-sm" color="dark">
                    {{ formattedDate }}
                  </ion-label>
                </div>

              </div>

              <hr class="mb-4 mx-4" v-if="groups.length || cleaners.length > 1">
              <!-- Participants -->
              <div class="px-4 py-2 lg:px-24 ripple-parent ion-activatable" v-if="!activity.user || cleaners.length > 1"
                   @click="openParticipantsModal">
                <span class="opacity-50 text-sm">
                  {{ $t('participants') }}
                </span>
                <div class="space-x-2 -ml-1 ion-text-nowrap overflow-hidden  relative chips-list"
                     :class="{'chips-overflow': invisibleUsers}">
                  <user-chip v-for="(user, i) in cleaners" :key="i" :user="user" ref="user-chips"/>

                  <transition name="fade">
                    <div class="invisible-count font-bold opacity-50 text-sm pr-2" v-if="invisibleUsers">
                      +{{ invisibleUsers }}
                    </div>
                  </transition>
                </div>
                <ion-ripple-effect/>
              </div>

              <!-- Groups -->
              <div class="mb-4 px-4 py-2 lg:px-24 ripple-parent ion-activatable" v-if="groups.length"
                   @click="openGroupsModal()">
                <span class="opacity-50  text-sm">
                    {{ $t(!activity.group ? 'tagged-group' : groups.length === 1 ? 'organizer' : 'organizers') }}
                </span>
                <div class="space-x-2 -ml-1 ion-text-nowrap overflow-hidden  relative chips-list"
                     :class="{'chips-overflow': invisibleGroups}">
                  <ion-chip class="ml-0 mr-0" color="dark" v-for="group in groups" :key="group.id"
                            ref="group-chips">
                    <!--@click="$router.push('/user/' + activity.user.username)"-->
                    <ion-avatar>
                      <img :src="group.picture && group.picture.publicUrl || '/img/user-placeholder.png'">
                    </ion-avatar>
                    <ion-label class="mr-2 font-bold">{{ group.name }}</ion-label>
                  </ion-chip>

                  <transition name="fade">
                    <div class="invisible-count font-bold opacity-50 text-sm pr-2" v-if="invisibleGroups">
                      +{{ invisibleGroups }}
                    </div>
                  </transition>
                </div>
                <ion-ripple-effect/>
              </div>

              <hr class="mx-4" :class="{'mt-4': groups.length || cleaners.length > 1}">
              <div class="px-4 py-4 lg:px-24">
                <!-- Location -->
                <div class="flex items-center mb-4">
                  <ion-icon class="mr-2 text-lg w-8" color="secondary" name="location-sharp"></ion-icon>
                  <ion-label class="font-bold ion-text-wrap">
                    <span class="text-base">{{ addressString }}</span>
                  </ion-label>
                </div>

                <!-- Map -->
                <div
                    class="h-2/3 mt-2 rounded-md w-full map-wrapper overflow-hidden ripple-parent cursor-pointer">
                  <img v-if="width" :src="`https://maps.googleapis.com/maps/api/staticmap?key=${KEY}`
                                + `&markers=icon:https://storage.googleapis.com/csfn-public-assets/pin_cleanup.png|${activity.location.coords.lat},${activity.location.coords.lng}`
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
import MapModal from '@/views/pages/home/community/CleanupsMapPage.vue'
import moment from 'moment'
import PicturesModal from '@/views/modals/PicturesModal.vue'
import TransparentHeader from '@/views/components/common/TransparentHeader.vue'
import {Ref} from 'vue-property-decorator'
import PageTransparentHeader from '@/views/components/common/PageTransparentHeader.vue'
import Cleanup from '@/types/Cleanup'
import {cleanupsModule} from '@/store/cleanupsModule'
import Image from '@/types/Image'
import {addressToString, remToPixel} from '@/tools/Utils'
import CountChip from '@/views/components/common/CountChip.vue'
import {userProvider} from '@/providers/data/user.provider'
import {GroupStatus} from '@/types/GroupStatus'
import ParticipantsListModal from '@/views/modals/ParticipantsListModal.vue'
import GroupsListModal from '@/views/modals/GroupsListModal.vue'
import PopoverPresenter from '@/tools/PopoverPresenter'
import {PopoverListItem} from '@/types/PopoverListItem'
import _ from 'lodash'
import {groupsProvider} from '@/providers/data/groups.provider'
import ToastPresenter from '@/tools/ToastPresenter'
import ErrorMessage from '@/tools/ErrorMessage'
import UserChip from '@/views/components/common/UserChip.vue'

@Component({
  name: 'cleanup-page',
  components: {UserChip, PageTransparentHeader, TransparentHeader, CountChip}
})
export default class ActivityPage extends Vue {

  KEY = process.env.VUE_APP_GOOGLE_API_KEY

  width = 0
  isAdmin = false
  invisibleUsers = 0
  invisibleGroups = 0

  @Ref('activity-content')
  content: HTMLIonContentElement

  get isSmall() {
    return window.innerWidth < 600
  }

  get activity(): Cleanup {
    return cleanupsModule.getCleanup
    //return cleanupsModule.getCleanup(this.$route.params.id)
  }

  get title(): string {
    return this.$t('cleanup-in') + ' ' + this.activity.location.address.city
    //return this.activity.type === ActivityType.event ? this.activity.title : `${this.$t(this.activity.type + '-in')} ${this.activity.location.address.city}`
  }

  get currentUser(): User {
    return userModule.getCurrentUser
  }

  get formattedDate() {
    return this.activity && moment(this.activity.date).format('D MMMM YYYY')
  }

  get addressString() {
    return addressToString(this.activity.location.address)
  }

  get cleaners() {
    return [...(this.activity?.user ? [this.activity?.user] : []), ...(this.activity?.taggedUsers || [])]
  }

  get groups() {
    return [...(this.activity?.group ? [this.activity?.group] : []), ...(this.activity?.taggedGroups || [])]
  }

  get canEdit() {
    return this.activity?.user?.id === userModule.getCurrentUser.id || this.isAdmin
  }

  get moreMenu() {
    const menu: PopoverListItem[] = []

    if (!_.find(this.cleaners, {id: userModule.getCurrentUser.id}) && this.activity?.group && !this.isAdmin) {
      menu.push({
        label: this.$t('tag-me'),
        onClick: this.sendTagRequest
      })
    }

    return menu
  }

  mounted() {
    cleanupsModule.setCleanup(null)
    cleanupsModule.fetchCleanup(Number(this.$route.params.id))
        .then(() => {
          if (this.activity.group && !this.activity.user) {
            userProvider.fetchUserGroupStatus(this.currentUser.id, this.activity.group.id)
                .then(({status}) => this.isAdmin = status === GroupStatus.ADMIN)
          }
        })
    setTimeout(() => {
      this.width = Math.round(window.innerWidth < 600 ? window.innerWidth : window.innerWidth - remToPixel(12))
    })
    this.invisibleUsers = 0
    setTimeout(() => {
      (this.$refs['user-chips'] as any[]).forEach(({$el: chip}: { $el: HTMLElement }) => {
        if (chip.offsetLeft > chip.parentElement.offsetWidth - 100) {
          this.invisibleUsers++
          chip.classList.add('invisible')
        }
      })
    }, 500)
    setTimeout(() => {
      (this.$refs['group-chips'] as any[]).forEach((chip: HTMLElement) => {
        if (chip.offsetLeft > chip.parentElement.offsetWidth - 100) {
          this.invisibleGroups++
          chip.classList.add('invisible')
        }
      })
    }, 500)
  }

  showMoreMenu(event) {
    PopoverPresenter.presentList(this.$ionic, event, this.moreMenu)
  }

  openMap() {
    ModalPresenter.present(this.$ionic, MapModal, {
      title: this.title,
      origin: this.activity.location.coords,
      pin: '/img/cleanup_pin.png'
    })
  }

  openPictures(selected) {
    ModalPresenter.present(this.$ionic, PicturesModal, {
      pictures: (this.activity.pictures as Image[]).map(({publicUrl}) => publicUrl),
      selected
    })
  }

  edit() {
    return
  }

  onScroll(event) {
    (this.$refs['page'] as any).scrolled(event)
  }

  openParticipantsModal() {
    ModalPresenter.present(this.$ionic, ParticipantsListModal, {
      title: this.$t('participants'),
      participants: this.cleaners
    })
  }

  openGroupsModal() {
    ModalPresenter.present(this.$ionic, GroupsListModal, {
      title: this.$t('organizers'),
      groups: this.groups,
      $router: this.$router
    })
  }

  sendTagRequest() {
    groupsProvider.sendTagRequest(this.activity.group.id, this.activity.id)
        .then(() => ToastPresenter.present(this.$ionic, this.$t('tag-request-sent'), 'success'))
        .catch(error => {
          ToastPresenter.present(this.$ionic, ErrorMessage.getMessage(error))
        })
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
