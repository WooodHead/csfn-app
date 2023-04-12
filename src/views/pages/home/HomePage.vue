<template>
  <ion-page class="ion-page home-page">

    <ion-slides ref="slider" :options="{initialSlide: 3, resistanceRatio: 1, cssMode: true, centeredSlides: true}"
                class="w-full h-full"
                @ionSlideWillChange="slided">
      <ion-slide>
        <current-user-page v-if="loaded || $route.params.tab === 'user'" ref="user"/>
      </ion-slide>
      <ion-slide>
        <groups-page v-if="loaded || $route.params.tab === 'groups'" ref="groups"/>
      </ion-slide>
      <ion-slide>
        <community-page v-if="loaded || $route.params.tab === 'community'" ref="community"/>
      </ion-slide>
      <ion-slide>
        <events-page v-if="loaded || $route.params.tab === 'events'" ref="events"/>
      </ion-slide>
    </ion-slides>

    <ion-tab-bar mode="ios" class="home-tabs">
      <ion-tab-button v-for="tab in tabs" :key="tab" mode="ios" :disabled="!loaded"
                      :selected="selectedTab === tab" @click="slideTo(tab)">
        <transition name="fade">
          <ion-badge color="danger" mode="ios" class="-mt-2" v-if="tab === 'groups' && userGroupsHasRequests">
            {{ userGroupsHasRequests }}
          </ion-badge>
        </transition>
        <transition name="fade">
          <ion-icon v-if="selectedTab === tab" :src="require('@/assets/img/tabs/' + tab + '.svg')"
                    size="large"></ion-icon>
          <ion-icon v-else :src="require('@/assets/img/tabs/' + tab + '_off.svg')" size="large"></ion-icon>
        </transition>
      </ion-tab-button>
    </ion-tab-bar>

    <ion-fab class="add-fab" horizontal="end" mode="ios" vertical="bottom">
      <ion-fab-button color="white" @click="publish" mode="ios">
        <ion-icon color="primary" name="add-outline" size="large"
                  style="stroke: var(--ion-color-primary); stroke-width: 50px"/>
      </ion-fab-button>
    </ion-fab>
  </ion-page>
</template>

<script lang="ts">
import HomeHeader from '@/views/components/home/HomeHeader.vue'
import CleanupCard from '@/views/components/common/CleanupCard.vue'
import PlaceholderCard from '@/views/components/home/PlaceholderCard.vue'
import HomeCleanupsList from '@/views/components/home/CleanupsList.vue'
import CurrentUserPage from '@/views/pages/home/user/CurrentUserPage.vue'
import EventsPage from '@/views/pages/home/events/EventsPage.vue'
import {Component, Ref, Vue, Watch} from 'vue-property-decorator'
import {nativeProvider} from '@/providers/native/native.provider'
import {cleanupsModule} from '@/store/cleanupsModule'
import GroupsPage from '@/views/pages/home/groups/GroupsPage.vue'
import {userModule} from '@/store/userModule'
import {userProvider} from '@/providers/data/user.provider'
import ModalPresenter from '@/tools/ModalPresenter'
import PublishAsModal from '@/views/modals/PublishAsModal.vue'
import {recyclingModule} from '@/store/recyclingModule'
import CommunityPage from './community/CommunityPage.vue'

@Component({
  name: 'HomePage',
  components: {
    EventsPage,
    CommunityPage,
    GroupsPage,
    CurrentUserPage,
    HomeCleanupsList,
    PlaceholderCard: PlaceholderCard,
    CleanupCard: CleanupCard,
    HomeHeader
  }
})
export default class HomePage extends Vue {

  loaded = false

  tabs = ['user', 'groups', 'community', 'events']

  selectedTab = ''

  @Ref('slider')
  slider: HTMLIonSlidesElement

  get userGroupsHasRequests() {
    return userModule.getGroupsHasRequests
  }

  mounted() {
    nativeProvider.hideSplashScreen()
    cleanupsModule.setCleanup(null)
    recyclingModule.setStation(null)
    userModule.fetchUserGroupsHasRequests()
    this.changedRoute(this.$route)
    this.slider.slideTo(this.tabs.indexOf(this.$route.params.tab), 0)
    setTimeout(() => {
      this.loaded = true
    }, 1000)
  }

  activated() {
    this.mounted()
  }

  @Watch('$route')
  changedRoute(route) {
    if (route.name === 'HomePage') {
      try {
        this.selectedTab && (this.$refs[this.selectedTab] as any).exit()
      } catch (ignore) {
        //
      }
      this.selectedTab = route.params.tab

      try {
        (this.$refs[route.params.tab] as any).init()
      } catch (ignore) {
        //
      }
    }
  }

  slideTo(tab) {
    this.slider.slideTo(this.tabs.indexOf(tab))
  }

  slided() {
    this.slider.isBeginning().then((beg) => this.slider.lockSwipeToPrev(beg))
    this.slider.isEnd().then((end) => this.slider.lockSwipeToNext(end))
    this.slider.getActiveIndex()
        .then(index => {
          if (this.tabs[index] !== this.selectedTab) {
            this.$router.replace('/home/' + this.tabs[index])
          }
        })
  }

  publish() {
    userProvider.fetchUserGroups(userModule.getCurrentUser.id, 0, 0, true)
        .then(({data, meta}) => {
          if (meta.totalItems) {
            ModalPresenter.present(this.$ionic, PublishAsModal, {
              user: userModule.getCurrentUser,
              groups: data.map(({group}) => group),
              texts: {
                title: this.$t('publish-as'),
                cancel: this.$t('cancel'),
                accept: this.$t('accept')
              },
            }, 'publish-as-modal')
                .then(({data}) => {
                  if (data) {
                    this.$router.push('/edit-cleanup?group=' + (data !== 'user' ? data : ''))
                  }
                })
          } else {
            this.$router.push('/edit-cleanup')
          }
        })
  }
}
</script>
<style>
.home-tabs .tab-disabled {
  opacity: 1;
}

.tab-button {
  height: 150%;
}

ion-fab-button[data-desc] {
  position: relative;
}

ion-fab-button[data-desc]::before {
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  color: var(--ion-text-color);
  content: attr(data-desc);
  /*background-color: var(--ion-color-dark);*/
  opacity: 0.9;
  padding: 4px 8px;
  position: absolute;
  right: 50px;
  /*color: white;*/
  top: 6px;
  z-index: 1;
}

ion-fab-button[data-desc]::after {
  border-color: transparent transparent transparent #fff;
  border-style: solid;
  border-width: 5px;
  content: " ";
  left: -25%;
  position: absolute;
  top: 40%;
  z-index: 1;
  /*border-color: transparent transparent transparent var(--ion-color-dark);*/
}

ion-tab-button {
  border-top: 1px solid #ccc;
  transition: border 0.25s;
}

ion-tab-button {
  position: relative;
}

ion-tab-button:after {
  content: '';
  background: var(--ion-color-primary);
  position: absolute;
  margin-top: -1px;
  z-index: 10;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  opacity: 0;
  transition: opacity 0.3s;
}

ion-tab-button.tab-selected:after {
  opacity: 1;
}

.add-fab {
  margin-bottom: calc(50px + var(--ion-safe-area-bottom));
}

.publish-as-modal {
  --min-height: 50vh;
  --height: 50vh;
}

.publish-as-modal .modal-wrapper {
  position: absolute;
  bottom: 0;
  border-top-left-radius: 0.5rem;
  border-top-right-radius: 0.5rem;
}

@media (min-width: 600px) {
  .publish-as-modal {
    --min-height: 30vh;
    --height: 30vh;
  }

  .publish-as-modal .modal-wrapper {
    max-width: 500px;
  }
}

.publish-as-modal ion-header ion-toolbar {
  padding-top: 0 !important;
}

</style>
