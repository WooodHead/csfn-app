<template>
  <page-transparent-header ref="page" :transparent="true">
    <ion-page class="ion-page">
      <transparent-header>
        <template slot="end-buttons">
          <ion-button v-if="status === 'ADMIN'" fill="clear"
                      shape="round" class="overflow-visible w-14 -mr-2"
                      @click="$router.push(`/group/${id}/settings`)">
            <ion-badge v-if="requests" color="danger" class="-mt-4 -mr-4 h-4 p-0 z-50 absolute">
              <span class="text-xs">{{ requests }}</span>
            </ion-badge>
            <ion-icon name="settings-sharp"></ion-icon>
          </ion-button>
        </template>
      </transparent-header>

      <ion-content ref="cleanup-content" :scroll-events="true" class="fullscreen" color="lighter" @ionScroll="onScroll">
        <transition name="fade">
          <div v-if="loading" class="bg-gray-100 h-screen w-full flex items-center justify-center">
            <ion-spinner color="primary"></ion-spinner>
          </div>
          <div class="m-auto" v-else>

            <!-- Cover -->
            <div class="h-48 relative">
              <transition name="fade">
                <div class="h-full w-full absolute top-0 left-0">
                  <img v-if="group && group.cover" :src="group.cover.publicUrl" class="object-cover w-full h-full">
                  <cover-placeholder v-else :image="group.picture.publicUrl"/>
                </div>
              </transition>
            </div>

            <div class="relative shadow-md bg-white" v-if="group">

              <div class="relative h-16">
                <ion-avatar class="w-32 h-32 -mt-16 z-10 absolute shadow-md bg-white" style="left: calc(50% - 4rem)">
                  <img :src="group.picture.publicUrl"/>
                </ion-avatar>
              </div>


              <div class="absolute top-0 left-0 p-2 flex flex-col w-1/3">
                <a :href="'https://instagram.com/' + group.instagram" target="_blank" v-if="group.instagram">
                  <ion-chip color="instagram" class="px-3 h-7 max-w-full">
                    <div class="flex items-center -ml-1">
                      <ion-icon class="mr-1 font-xs min-w-4" :src="require('ionicons5/dist/svg/logo-instagram.svg')"/>
                    </div>
                    <ion-label class="text-xs truncate">{{ group.instagram }}</ion-label>
                  </ion-chip>
                </a>
              </div>

              <div class="absolute top-0 right-0 p-2 w-1/3 text-right">
                <transition name="fade">
                  <group-status-button :loading="loadingStatus" :status="status" @join="join" @leave="leave"
                                       @cancelJoin="cancelJoin"/>
                </transition>
              </div>

              <div class="flex flex-col items-center mt-4" v-if="group">
                <span class=" text-xl font-bold inline-flex items-center -mr-8">
                  {{ group.name }}
                  <ion-chip class="w-6 h-6 p-0 ml-2" color="dark" @click="showCategoryDescription">
                    <fa-icon class="text-sm m-auto" :icon="group.category.icon"></fa-icon>
                  </ion-chip>
                </span>
                <span class="text-sm opacity-75 mt-1 mx-14 text-center">{{ group.mission }}</span>
                <div class="text-xs opacity-50 mt-2 flex items-center">
                  <ion-icon name="location-sharp"/>
                  {{ group.city }}, {{ group.country }}
                </div>
              </div>

              <div class="relative" :class="{'h-44': group.totalCleanups && recyclingStats}">
                <transition :name="`slide-fade-${stats === 'cleanups' ? 'right' : 'left'}`">
                  <div class="flex justify-around w-full mt-2 px-2"
                       :class="{'absolute pb-8': group.totalCleanups && recyclingStats}"
                       v-if="group && (group.totalCleanups && stats === 'cleanups' || !recyclingStats) "
                       key="cleanups-stats">
                    <stats-counter :icon-src="require('ionicons5/dist/svg/trash-outline.svg')" :label="$t('cleanups')"
                                   :max="1" progress-value="1" :key="'cleanups' + totalCleanups"
                                   :value="totalCleanups" no-animate/>

                    <stats-counter :icon-src="require('@/assets/img/icons/bag-outline.svg')"
                                   progress-value="1" :label="$t('liters')" :max="1"
                                   :value="totalVolume" :key="'volume-'+ totalVolume" no-animate/>

                    <stats-counter :icon-src="require('@/assets/img/icons/scale-outline.svg')"
                                   progress-value="1" :label="$t('kilos')" :max="1"
                                   :value="totalWeight" :key="'weight' + totalWeight" no-animate/>
                    <ion-button class="absolute bottom-0 right-0 mr-2" color="blue" size="small" fill="clear"
                                v-if="recyclingStats" @click="stats = 'recyclings'" shape="round">
                      <fa-icon icon="fa-solid fa-recycle" slot="start" class="mr-1"/>
                      {{ $t('recyclings') }}
                      <ion-icon :src="require('ionicons5/dist/svg/chevron-forward.svg')" class="visible" slot="end"/>
                    </ion-button>
                  </div>

                  <div class="flex justify-around w-full mt-2 px-2"
                       :class="{'absolute pb-8': group.totalCleanups && recyclingStats}"
                       v-else-if="recyclingStats && !group.totalCleanups || stats === 'recyclings'"
                       key="recycling-stats">
                    <stats-counter :icon-src="require('ionicons5/dist/svg/trash-outline.svg')" :label="type.type.name"
                                   :max="1" progress-value="1" :key="'cleanups' + 0"
                                   :value="type.totalCount" no-animate :colors="['#426eff', '#426eff']">
                      <template slot="icon">
                        <fa-icon :icon="type.type.icon" class="text-sm -mt-1"/>
                      </template>
                    </stats-counter>

                    <stats-counter :icon-src="require('@/assets/img/icons/bag-outline.svg')"
                                   progress-value="1" :label="$t('liters')" :max="1"
                                   :value="recyclingStats.totalVolume" :key="'volume-'+ recyclingStats.totalVolume"
                                   no-animate :colors="['#426eff', '#426eff']"/>

                    <stats-counter :icon-src="require('@/assets/img/icons/scale-outline.svg')"
                                   progress-value="1" :label="$t('kilos')" :max="1"
                                   :value="recyclingStats.totalWeight" :key="'weight-' + recyclingStats.totalWeight"
                                   no-animate :colors="['#426eff', '#426eff']"/>

                    <ion-button class="absolute bottom-0 left-0 ml-2" color="secondary" size="small" fill="clear"
                                v-if="group.totalCleanups" @click="stats = 'cleanups'" shape="round">
                      <ion-icon :src="require('ionicons5/dist/svg/chevron-back.svg')" class="visible" slot="start"/>
                      {{ $t('cleanups') }}
                      <ion-icon :src="require('ionicons5/dist/svg/trash-outline.svg')" class="visible text-base"
                                slot="end"/>
                    </ion-button>
                  </div>
                </transition>
              </div>

              <div v-if="loading" class="flex justify-around w-full mt-5 px-2 pt-2 pb-4">
                <ion-skeleton-text animated style="width: 96px; height: 96px" class="rounded-full"></ion-skeleton-text>
                <ion-skeleton-text animated style="width: 96px; height: 96px" class="rounded-full"></ion-skeleton-text>
                <ion-skeleton-text animated style="width: 96px; height: 96px" class="rounded-full"></ion-skeleton-text>
              </div>

              <div class="h-16">
                <div v-if="firstMembers" @click="$router.push(`/group/${id}/members`)"
                     class="flex items-center py-2 ion-activatable ripple-parent justify-center">
                  <ion-avatar v-for="(member, i) in firstMembers.data" :key="member.user.id"
                              :class="{'-ml-3': i > 0}"
                              class="border border-white border-solid w-8 h-8">
                    <img :src="member.user.picture.publicUrl"/>
                  </ion-avatar>
                  <ion-label class="ml-2 ion-text-wrap">
                  <span class="text-xs sm:text-sm opacity-75">
                    {{ firstMembers.meta.totalItems }} {{ $tc('members-message', firstMembers.meta.totalItems) }}
                  </span>
                  </ion-label>
                  <ion-ripple-effect/>
                </div>
                <div v-else class="flex items-center py-2 ion-activatable ripple-parent justify-center">
                  <ion-skeleton-text animated style="height: 30px; width: 30px;"
                                     class="rounded-full border border-solid border-white"/>
                  <ion-skeleton-text animated style="height: 30px; width: 30px;"
                                     class="rounded-full border border-solid border-white -ml-3"/>
                  <ion-skeleton-text animated style="height: 30px; width: 30px;"
                                     class="rounded-full border border-solid border-white -ml-3"/>
                  <ion-skeleton-text animated style="height: 30px; width: 200px;" class="rounded-full ml-4"/>
                </div>

              </div>
              <ion-segment mode="md" :value="segment" @ionChange="segment = $event.target.value" scrollable>
                <ion-segment-button mode="md" value="1" v-if="group.totalCleanups || !recyclingStats">
                  {{ $t('cleanups') }}
                </ion-segment-button>
                <ion-segment-button mode="md" value="2" v-if="recyclingStats">
                  {{ $t('recyclings') }}
                </ion-segment-button>
                <ion-segment-button mode="md" value="3">
                  {{ $t('info') }}
                </ion-segment-button>
              </ion-segment>
            </div>
            <div class="relative">
              <transition :name="`slide-${slideDirection}`">
                <div v-if="segment === '1'" key="cleanups" class="absolute top-0 w-full group-tab-content">
                  <div v-if="loadingCleanups" class="flex justify-center p-3 w-full">
                    <ion-spinner class="w-12 h-12" color="primary"/>
                  </div>

                  <div class="text-center pt-10 font-bold opacity-50 "
                       v-if="!loadingCleanups && cleanups && !cleanups.length">
                    {{ $t('no-cleanups-yet') }}
                  </div>

                  <div class="p-2 space-y-6  pb-8">
                    <cleanup-card v-for="{cleanup} in cleanups" :cleanup="cleanup" :key="cleanup.id"
                                  @click="$router.push('/cleanup/' + cleanup.id)"/>
                  </div>

                  <ion-infinite-scroll @ionInfinite="nextCleanups" :disabled="!hasMore" :key="'i' + hasMore">
                    <ion-infinite-scroll-content/>
                  </ion-infinite-scroll>
                </div>

                <div v-if="segment === '2'" key="recyclings" class="absolute top-0 w-full group-tab-content">
                  <recycling-card v-for="recycling in recyclings" :key="recycling.id" :recycling="recycling"
                                  title-location/>
                  <ion-infinite-scroll @ionInfinite="nextRecyclings" :disabled="!hasMoreRecyclings"
                                       :key="'i' + hasMoreRecyclings">
                    <ion-infinite-scroll-content/>
                  </ion-infinite-scroll>
                </div>

                <div v-else-if="segment === '3'" key="info" class="absolute top-0 w-full  group-tab-content">
                  <ion-card mode="ios">
                    <ion-item>
                      <ion-label class="ion-text-wrap max-w-full">
                        <span class="font-bold text-sm">{{ $t('description') }}</span>
                        <p>{{ group.description }}</p>
                      </ion-label>
                    </ion-item>

                    <ion-item v-if="group.web">
                      <ion-label>
                        <span class="font-bold text-sm">{{ $t('web') }}</span>
                        <p>
                          <a :href="group.web" target="_blank" class="inline-flex items-center">
                            <ion-icon name="globe" class="opacity-50 mr-1"/>
                            {{ group.web }}
                          </a>
                        </p>
                      </ion-label>
                    </ion-item>

                    <ion-item>
                      <ion-label>
                        <span class="font-bold text-sm">{{ $t('published-cleanups') }}</span>
                        <p>
                          {{ group.publishedCleanups }} {{ $tc('cleanups-p', group.publishedCleanups) }}
                        </p>
                      </ion-label>
                    </ion-item>
                    <ion-item v-if="group.taggedCleanups">
                      <ion-label>
                        <span class="font-bold text-sm">{{ $t('tagged-cleanups') }}</span>
                        <p>{{ group.taggedCleanups }} {{ $tc('cleanups-p', group.taggedCleanups) }}</p>
                      </ion-label>
                    </ion-item>
                  </ion-card>
                </div>
              </transition>
            </div>

          </div>
        </transition>
      </ion-content>
    </ion-page>
  </page-transparent-header>
</template>
<script lang="ts">
import Component from 'vue-class-component'
import {Vue, Watch} from 'vue-property-decorator'
import PageTransparentHeader from '@/views/components/common/PageTransparentHeader.vue'
import {GroupStatus} from '@/types/GroupStatus'
import CoverPlaceholder from '@/views/components/common/CoverPlaceholder.vue'
import TransparentHeader from '@/views/components/common/TransparentHeader.vue'
import {groupsModule} from '@/store/groupsModule'
import StatsCounter from '@/views/components/user/StatsCounter.vue'
import {userModule} from '@/store/userModule'
import GroupStatusButton from '@/views/components/groups/GroupStatusButton.vue'
import CleanupCard from '@/views/components/common/CleanupCard.vue'
import {groupsProvider} from '@/providers/data/groups.provider'
import ToastPresenter from '@/tools/ToastPresenter'
import ErrorMessage from '@/tools/ErrorMessage'
import {PaginatedResult} from '@/types/PaginatedResult'
import User from '@/types/User'
import {recyclingsProvider} from '@/providers/data/recyclings.provider'
import Recycling from '@/types/Recycling'
import RecyclingCard from '@/views/components/common/RecyclingCard.vue'

@Component({
  name: 'group-page',
  components: {
    PageTransparentHeader,
    CoverPlaceholder,
    TransparentHeader,
    StatsCounter,
    GroupStatusButton,
    CleanupCard,
    RecyclingCard
  }
})
export default class GroupPage extends Vue {

  id: number = null
  status: GroupStatus = null
  loadingStatus = true
  segment = '1'
  firstMembers: PaginatedResult<{ user: User }> = null
  slideDirection = 'left'
  loading = true
  joinRequestId?: number = null

  loadingRecyclings = false
  recyclingsPage = 1
  recyclings: Recycling[] = []
  hasMoreRecyclings = true
  totalRecyclings = 0
  stats = 'cleanups'

  @Watch('segment')
  segmentChanged(newValue, oldValue) {
    this.slideDirection = newValue > oldValue ? 'left' : 'right'
  }

  get group() {
    return groupsModule.getCurrentGroup
  }

  get loadingCleanups() {
    return groupsModule.isLoadingGroupCleanups
  }

  get totalCleanups() {
    return this.group?.totalCleanups?.toString() || ''
  }

  get totalWeight() {
    return this.group?.totalWeight?.toString() || ''
  }

  get totalVolume() {
    return this.group?.totalVolume?.toString() || ''
  }

  get cleanups() {
    return groupsModule.getCurrentGroupCleanups
  }

  get hasMore() {
    return groupsModule.getCurrentGroupHasMoreCleanups
  }

  get requests() {
    return groupsModule.groupHasRequests[this.id]
  }

  get recyclingStats() {
    return this.group.recyclingStats
  }

  get type() {
    return this.recyclingStats?.types[0]
  }

  mounted() {
    this.id = +this.$route.params.id
    if (!this.$route.meta.isBack || !groupsModule.getCurrentGroup || groupsModule.getCurrentGroup?.id !== this.id) {
      groupsModule.resetCurrentCleanups()
      groupsModule.fetchGroup(this.id)
          .then(() => {
            if (!this.group.totalCleanups && this.group.recyclingStats) {
              this.segment = '2'
            }
            groupsModule.fetchCurrentGroupCleanups()
            this.fetchRecyclings()
          })
          .finally(() => {
            this.loading = false
          })
    } else {
      this.loading = false
      this.fetchRecyclings()
      if (!this.group.totalCleanups && this.group.recyclingStats) {
        this.segment = '2'
      }
    }
    groupsProvider.fetchGroupMembers(this.id, 0, 3)
        .then((data) => this.firstMembers = data)
    this.fetchStatus()
  }

  fetchStatus() {
    this.loadingStatus = true
    userModule.fetchGroupStatus(this.id)
        .then(({status, requestId}) => {
          this.status = status
          this.joinRequestId = requestId
        })
        .finally(() => this.loadingStatus = false)
  }

  nextCleanups(event) {
    groupsModule.fetchNextCleanups()
        .finally(() => event.target.complete())
  }

  onScroll(event) {
    (this.$refs['page'] as any).scrolled(event)
  }

  join() {
    groupsProvider.findGroupQuestions(this.id)
        .then((questions) => {
          if (!questions.length) {
            this.loadingStatus = true
            groupsProvider.sendMemberRequest(this.id, {answers: []})
                .then(() => this.fetchStatus())
                .finally(() => this.loadingStatus = false)
          } else {
            this.$router.push('/group/' + this.id + '/member-request')
          }
        })
  }

  cancelJoin() {
    groupsProvider.removeMemberRequest(this.id, this.joinRequestId)
        .then(() => this.fetchStatus())
  }

  leave() {
    this.loadingStatus = true
    userModule.leaveGroup(this.id)
        .then(() => this.fetchStatus())
        .catch(error => {
          ToastPresenter.present(this.$ionic, ErrorMessage.getMessage(error))
        })
        .finally(() => this.loadingStatus = false)
  }

  async showCategoryDescription() {
    const alert = await this.$ionic.alertController.create({
      header: this.group.category.name,
      message: this.group.category.description,
      buttons: [{
        text: this.$t('accept').toString(),
        role: 'cancel'
      }]
    })
    await alert.present()
  }

  fetchRecyclings() {
    this.loadingRecyclings = true
    return recyclingsProvider.findAll({page: this.recyclingsPage, groupId: this.group.id})
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

}
</script>
<style>
.group-tab-content {
  min-height: calc(100vh - 140px);
}
</style>