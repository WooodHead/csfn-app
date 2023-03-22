<template>
  <ion-page class="ion-page absolute">
    <ion-header mode="ios">
      <ion-toolbar mode="ios">
        <ion-buttons slot="start">
          <ion-button color="dark" fill="clear" shape="round" @click="$router.back()">
            <ion-icon slot="icon-only" name="arrow-back"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title v-if="type">
          {{ $t(activity && activity.id ? 'edit' : 'publish') }} {{ $t(this.type).toLowerCase() }}
        </ion-title>
        <ion-buttons v-if="activity && activity.id"
                     slot="end">
          <ion-button color="danger" fill="clear" shape="round" @click="showRemoveAlert">
            <ion-icon slot="icon-only" :src="require('ionicons5/dist/svg/trash.svg')"
                      color="error"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content ref="content">
      <form class="lg:px-16 xl:px-40 bg-white" :style="{marginBottom: (this.keyboardHeight || 0) + 'px'}">
        <ion-list v-if="activity" class="p-0 pb-16" lines="full">

          <!-- PICTURES -->
          <input-item :errors="errors['pictures']" no-lines item-class="item-no-padding">
            <ion-row v-if="activity.pictures" class="w-full my-2 px-2">
              <ion-col v-for="i of [0,1,2,3,4]" :key="i">
                <upload-button :file="thumbnails[i]" :max="5 - activity.pictures.length"
                               :url="activity.pictures[i] && activity.pictures[i].publicUrl"
                               @click="resetError('pictures') || activity.pictures[i] && openImagePreview(i)"
                               @select="picturesSelected"></upload-button>
              </ion-col>
            </ion-row>
          </input-item>

          <input-item :errors="errors['description']" :slotted-input="$refs['desc']"
                      @focus="resetError('description')">
            <ion-textarea ref="desc" :value="activity.description" :placeholder="$t('description') "
                          maxlength="1024" rows="4" @click="runAutoScroll"
                          @ionChange="runAutoGrow() || change('description', $event.target.value)"></ion-textarea>
          </input-item>

          <!-- VOLUME -->
          <ion-picker-controller v-if="isCleanup"></ion-picker-controller>
          <input-item v-if="isCleanup" :errors="errors['volume']"
                      :icon-src="require('@/assets/img/icons/bag.svg')"
                      class="liters" end-note="Lt" type="number" @focus="openLitersPicker">
            <ion-label class="fix-label" position="floating">{{ $t('volume') }}</ion-label>
            <ion-input :value="activity.volume" readonly="true" type="number"
                       @focus="openLitersPicker"></ion-input>
          </input-item>

          <!-- WEIGHT -->
          <input-item v-if="isCleanup" :errors="errors['weight']"
                      :icon-src="require('@/assets/img/icons/scale.svg')"
                      :slotted-input="$refs.weight"
                      end-note="Kg" @focus="resetError('weight')">
            <ion-label class="fix-label" position="floating">{{ $t('weight') }} <span
                class="text-xs">{{ automaticWeight ? $t('automatic-weight') : '' }}</span></ion-label>
            <ion-input ref="weight" :value="activity.weight" enterkeyhint="enter"
                       type="number" @ionInput="automaticWeight = false" inputmode="numeric"
                       @ionChange="change('weight', $event.target.value)"></ion-input>
          </input-item>

          <!-- LOCATION -->
          <input-item :end-note="isEvent && activity.radius ? (`(${activity.radius} Km)`) : null"
                      :errors="errors['location']" icon="location-sharp"
                      @focus="openLocationSelection">
            <ion-label class="fix-label" position="floating">{{ $t('location') }}</ion-label>
            <ion-input :value="addressString" readonly="true"
                       type="text" @focus="openLocationSelection"></ion-input>
          </input-item>

          <!-- DATE -->
          <input-item v-if="isCleanup" :errors="errors['date']"
                      icon="calendar"
                      @focus="resetError('date') || $refs.date.open()">
            <ion-label class="fix-label" position="floating">{{ $t('date') }}</ion-label>
            <ion-datetime ref="date" v-model="activity.date" :max="today"
                          :readonly="true" :value="activity.date" display-format="DD/MM/YYYY"
                          picker-format="DD MMMM YYYY" :month-names="monthNames"
                          @ionChange="change('date', new Date($event.target.value))"></ion-datetime>
          </input-item>

          <!-- TAG USERS -->
          <input-item v-if="isCleanup" :icon-src="require('@/assets/img/icons/add-user.svg')"
                      @focus="openTagUsersSelection" :errors="errors['taggedUsers']" :help="$t('help-tag-users')">
            <ion-label class="fix-label" position="floating">{{ $t('tag-people') }}</ion-label>
            <ion-input
                :value="activity.taggedUsers && activity.taggedUsers.map((user) => user ? user.username : 'Anonymous' ).join(', ')"
                readonly="true"
                type="text" @focus="openTagUsersSelection"></ion-input>
          </input-item>

          <!-- TAG GROUPS -->
          <input-item v-if="isCleanup && (fromGroup || userHasGroups)"
                      :help="$t(fromGroup ? 'help-group-tag-groups' : 'help-user-tag-group')"
                      :icon-src="require('@/assets/img/icons/add-group.svg')"
                      @focus="openTagGroupsSelection">
            <ion-label class="fix-label" position="floating">
              {{ fromGroup ? $t('tag-groups') : $t('tag-a-group') }}
            </ion-label>
            <ion-input :value="activity.taggedGroups && activity.taggedGroups.map(({name}) => name).join(', ')"
                       readonly="true"
                       type="text" @focus="openTagGroupsSelection"></ion-input>
          </input-item>

          <input-item v-if="userAdminGroups && userAdminGroups.length"
                      :avatar-src="activity.user ? currentUser.picture.publicUrl : activity.group.picture.publicUrl"
                      @focus="showPublishAsModal">
            <ion-label class="fix-label" position="floating">
              {{ $t('published-as') }}
            </ion-label>
            <ion-input :value="activity.user ? activity.user.username : activity.group.name"
                       readonly="true"
                       type="text" @focus="showPublishAsModal"></ion-input>
          </input-item>

          <!--
          <input-item v-if="isEvent" v-model="activity.title" :errors="errors['title']"
                      :placeholder="$t('title')"
                      input-class="font-bold" @focus="resetError('title')"></input-item>

          <input-item v-if="isEvent" :errors="eventDatesErrors" icon="calendar" @focus="resetError('date')">
            <ion-row class="w-full">
              <ion-col :class="!activity.startDate ? 'no-value' : ''"
                       class="w-1/2 ion-activatable p-0 hydrated"
                       @click="$refs.startDate.open()">
                <ion-label class="fix-label" position="floating">{{ $t('startDate') }}</ion-label>
                <ion-datetime ref="startDate" v-model="activity.startDate" :max="nextYear"
                              :readonly="true" class="pl-0" display-format="DD/MM/YYYY"
                              picker-format="DD MMMM YYYY"
                              @ionChange="change('startDate', new Date($event.target.value))"></ion-datetime>
              </ion-col>
              <ion-col :class="!activity.endDate ? 'no-value' : ''"
                       class="w-1/2 ion-activatable p-0 hydrated"
                       @click="$refs.endDate.open()">
                <ion-label class="fix-label" position="floating">{{ $t('endDate') }}</ion-label>
                <ion-datetime ref="endDate" v-model="activity.endDate" :max="nextYear"
                              :readonly="true" class="pl-0" display-format="DD/MM/YYYY"
                              picker-format="DD MMMM YYYY"
                              @ionChange="change('endDate', new Date($event.target.value))"></ion-datetime>
              </ion-col>
            </ion-row>
          </input-item>

          <input-item v-if="isEvent" :errors="errors['targetVolume']"
                      :icon-src="require('@/assets/img/icons/bag.svg')"
                      :slotted-input="$refs.targetVolume"
                      end-note="Lt" @focus="resetError('targetVolume')">
            <ion-label class="fix-label" position="floating">{{ $t('targetVolume') }}</ion-label>
            <ion-input ref="targetVolume" type="number"
                       @ionChange="change('targetVolume', $event.target.value)"></ion-input>
          </input-item>
          <input-item v-if="isEvent" :errors="errors['targetWeight']"
                      :icon-src="require('@/assets/img/icons/scale.svg')"
                      :slotted-input="$refs.targetWeight"
                      end-note="Kg" @focus="resetError('targetWeight')">
            <ion-label class="fix-label" position="floating">{{ $t('targetWeight') }}</ion-label>
            <ion-input ref="targetWeight" type="number"
                       @ionChange="change('targetWeight', $event.target.value)"></ion-input>
          </input-item>
          -->
        </ion-list>
      </form>
    </ion-content>
    <ion-footer>
      <ion-toolbar class="px-2 pb-safe ios:pt-2">
        <ion-button class="sm:w-2/3 lg:w-1/2 m-auto" color="primary" fill="solid" shape="round" size="block"
                    @click="activity.id ? update() : publish()">
          {{ $t(activity && activity.id ? 'save' : 'publish') }}
        </ion-button>
      </ion-toolbar>
    </ion-footer>
  </ion-page>
</template>
<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import ModalPresenter from '@/tools/ModalPresenter'
import LocationModal from '@/views/modals/SelectCleanupLocationModal.vue'
import {locationModule} from '@/store/locationModule'
import {placesProvider} from '@/providers/places/places.provider'
import Location from '@/types/Location'
import PicturesModal from '@/views/modals/PicturesModal.vue'
import UploadButton from '@/views/components/common/UploadButton.vue'
import FormError from '@/types/errors/FormError'
import ErrorMessage from '@/tools/ErrorMessage'
import InputError from '@/views/components/common/InputError.vue'
import InputItem from '@/views/components/common/InputItem.vue'
import range from 'lodash/range'
import {addressToString, monthNames} from '@/tools/Utils'
import {ActivityType} from '@/types/ActivityType'
import Cleanup from '@/types/Cleanup'
import {cleanupsModule} from '@/store/cleanupsModule'
import ToastPresenter from '@/tools/ToastPresenter'
import Validator from '@/tools/Validator'
import {appModule} from '@/store/appModule'
import UnknownError from '@/types/errors/UnknownError'
import {userModule} from '@/store/userModule'
import {resizePicture} from '@/tools/ImageProcessor'
import {Prop} from 'vue-property-decorator'
import Image from '@/types/Image'
import {Keyboard, KeyboardInfo} from '@capacitor/keyboard'
import {plainToClass} from 'class-transformer'
import TagUsersModal from '@/views/modals/TagUsersModal.vue'
import {userProvider} from '@/providers/data/user.provider'
import TagGroupsModal from '@/views/modals/TagGroupsModal.vue'
import Group from '@/types/Group'
import PublishAsModal from '@/views/modals/PublishAsModal.vue'
import UserGroup from '@/types/GroupMember'
import _ from 'lodash'

@Component({
  name: 'edition-page',
  components: {InputItem, InputError, UploadButton}
})
export default class EditionPage extends Vue {

  @Prop()
  type: ActivityType

  errors = {}

  activity: Cleanup = null
  thumbnails: (Blob | string)[] = []
  previousPictures = []
  removedPictures: number[] = []
  automaticWeight = false
  keyboardHeight = 0
  textareaHeight = 0
  scroll = 0
  fromGroup = null
  userHasGroups = true
  userAdminGroups: UserGroup[] = null

  get monthNames() {
    return monthNames[this.$i18n.locale]
  }

  get currentUser() {
    return userModule.getCurrentUser
  }

  get isCleanup() {
    return this.type === ActivityType.cleanup
  }

  get isAlert() {
    return this.type === ActivityType.alert
  }

  get isEvent() {
    return this.type === ActivityType.event
  }

  get coords() {
    return locationModule.getCoords
  }

  get address() {
    return locationModule.getAddress
  }

  get today() {
    return new Date().toISOString().split('T')[0]
  }

  get nextYear() {
    return new Date().getFullYear() + 1
  }

  get addressString() {
    return this.activity.location && addressToString(this.activity.location.address)
  }

  get eventDatesErrors() {
    return [...(this.errors['startDate'] || []), ...(this.errors['endDate']) || []]
  }

  get hasTaggedUsers() {
    return this.activity.taggedUsers?.length
  }

  get publishMethod() {
    switch (this.type) {
      case 'cleanup':
        return cleanupsModule.publish
      default:
        return null
    }
  }

  get updateMethod() {
    switch (this.type) {
      case 'cleanup':
        return cleanupsModule.update
      default:
        return null
    }
  }

  get removeMethod() {
    switch (this.type) {
      case 'cleanup':
        return cleanupsModule.remove
      default:
        return null
    }
  }

  mounted(): void {
    this.fromGroup = this.$route.query['group']
    this.$set(this, 'activity', cleanupsModule.getCleanup || new Cleanup())
    if (this.activity.id) {
      this.previousPictures = [...this.activity.pictures]
      this.thumbnails = (this.activity.pictures as Image[]).map(({publicUrl}) => publicUrl)
      this.fromGroup = this.activity.group?.id
    }
    if (this.fromGroup) {
      this.activity.group = {id: Number(this.fromGroup)} as Group
    } else {
      userProvider.fetchUserGroups(userModule.getCurrentUser.id, 1, 1)
          .then(({meta}) => this.userHasGroups = !!meta.totalItems)
    }

    if (this.activity.id && this.activity.user) {
      userProvider.fetchUserGroups(userModule.getCurrentUser.id, 0, 0, true)
          .then(({data, meta}) => {
            this.userAdminGroups = data
          })
    }

    Keyboard.addListener('keyboardWillShow', (info: KeyboardInfo) => {
      this.keyboardHeight = info.keyboardHeight
    })
    Keyboard.addListener('keyboardWillHide', () => {
      this.keyboardHeight = 0
    })
  }

  publish() {
    this.save(this.publishMethod, 'published', this.activity)
  }

  update() {
    this.save(this.updateMethod, 'updated', {cleanup: this.activity, removedPictures: this.removedPictures})
  }

  remove() {
    this.doRemove(this.removeMethod)
  }

  save(method: (any) => Promise<void>,
       successMessage: string,
       param: any) {
    appModule.showLoader(this.$ionic)
        .then(() => Validator.validate(plainToClass(Cleanup, this.activity)))
        .then(() => method.apply(cleanupsModule, [param]))
        .then(() => {
          ToastPresenter.present(this.$ionic, this.$t(this.type) + ' ' + this.$t(successMessage).toString().toLowerCase(), 'success')
          this.$router.back()
        })
        .catch((error) => {
          if (error instanceof FormError) {
            error.fieldErrors.forEach((error) => {
              this.$set(this.errors, error.param, [ErrorMessage.getMessage(error)])
            })
          } else if (error instanceof UnknownError) {
            ToastPresenter.present(this.$ionic, ErrorMessage.getMessage(error))
          }
        })
        .finally(() => {
          appModule.hideLoader()
        })
  }

  openTagUsersSelection() {
    this.resetError('taggedUsers')
    ModalPresenter.present(this.$ionic, TagUsersModal, {
      texts: {
        search: this.$t('search-users'),
        suggestions: this.$t('suggestions'),
        selected: this.$t('selected'),
        results: this.$t('results'),
        noResults: this.$t('no-results'),
        noSuggestions: this.$t('search-a-user')
      },
      groupId: this.fromGroup,
      initSelected: this.activity.taggedUsers,
      isGroup: !!this.fromGroup
    }).then(({data}) => {
      Vue.set(this.activity, 'taggedUsers', data)
    })
  }

  openTagGroupsSelection() {
    ModalPresenter.present(this.$ionic, TagGroupsModal, {
      texts: {
        search: this.$t('search-groups'),
        suggestions: this.$t('suggestions'),
        selected: this.$t('selected'),
        results: this.$t('results'),
        noResults: this.$t('no-results'),
        noSuggestions: this.$t('search-a-group')
      },
      groupId: +this.fromGroup,
      initSelected: this.activity.taggedGroups,
      isGroup: !!this.fromGroup
    }).then(({data}) => {
      Vue.set(this.activity, 'taggedGroups', data)
    })
  }

  doRemove(method: (id: number) => Promise<void>) {
    appModule.showLoader(this.$ionic)
        .then(() => method.apply(cleanupsModule, [this.activity.id]))
        .then(() => {
          appModule.hideLoader()
          ToastPresenter.present(this.$ionic, this.$t(this.type) + ' ' + this.$t('removed').toString().toLowerCase(), 'success')
          this.$router.push('/home')
        })
        .catch((error) => {
          appModule.hideLoader()
          if (error instanceof FormError) {
            error.fieldErrors.forEach((error) => {
              this.$set(this.errors, error.param, [ErrorMessage.getMessage(error)])
            })
          } else if (error instanceof UnknownError) {
            ToastPresenter.present(this.$ionic, ErrorMessage.getMessage(error))
          }
        })
  }

  showRemoveAlert() {
    this.$ionic.alertController.create({
      header: this.$t('remove-header', [this.$t(this.type)]).toString(),
      message: this.$t('remove-message', [this.$t('the-' + this.type)]).toString(),
      buttons: [{
        text: this.$t('cancel').toString(),
        role: 'cancel'
      }, {
        text: this.$t('delete').toString(),
        handler: () => {
          this.remove()
        }
      }]
    }).then((alert) => alert.present())
  }

  openLocationSelection() {
    this.resetError('location')
    ModalPresenter.present(this.$ionic, LocationModal, {
      currentCoords: this.activity.location?.coords || this.coords,
      currentAddress: this.activity.location?.address || this.address,
      searchPlaceholder: this.$t('search-place'),
      cancelText: this.$t('cancel'),
      acceptText: this.$t('confirm'),
      showRadius: this.isEvent,
      pin: '/img/pin_cleanup.png'
    }).then(({data}) => {
      if (data) {
        placesProvider.getAddress(data.selectedCoords)
            .then((address) => {
              this.$set(this.activity, 'location', new Location(address, data.selectedCoords))
              //this.$set(this.activity, 'radius', data.radius)
            })
      }
    })
  }

  openLitersPicker() {
    this.resetError('volume')
    document.querySelector('ion-picker-controller').create({
      cssClass: 'liters',
      columns: [{
        name: 'bags',
        options: range(1, 101).map(i => ({value: i, text: `${i} ${this.$tc('bags', i)}`}))
      }, {
        name: 'of',
        options: [{text: this.$t('of').toString()}]
      }, {
        name: 'capacity',
        options: [{
          value: 5,
          text: `5 ${this.$t('liters').toString().toLowerCase()}`
        }, ...range(10, 110, 10).map(i => ({
          value: i,
          text: `${i} ${this.$t('liters').toString().toLowerCase()}`
        }))]
      }],
      buttons: [
        {
          text: this.$t('custom').toString(),
          cssClass: 'absolute left-0 top-0',
          handler: () => {
            this.$ionic.alertController.create({
              header: this.$t('volume').toString(),
              inputs: [{
                type: 'text',
                placeholder: this.$t('enter-liters').toString()
              }],
              buttons: [{
                text: this.$t('cancel').toString()
              },
                {
                  text: this.$t('confirm').toString(),
                  handler: (value) => {
                    if (!value[0]) return
                    this.$set(this.activity, 'volume', +value[0])
                    this.$set(this.activity, 'weight', this.activity.volume * 0.1)
                    this.automaticWeight = true
                  }
                }]
            }).then(alert => alert.present())
          }
        },
        {
          text: this.$t('cancel').toString(),
          role: 'cancel'
        },
        {
          text: this.$t('confirm').toString(),
          handler: (value) => {
            this.$set(this.activity, 'volume', value.bags.value * value.capacity.value)
            this.$set(this.activity, 'weight', this.activity.volume * 0.1)
            this.automaticWeight = true
          }
        }
      ]
    }).then((picker: HTMLIonPickerElement) => picker.present())
  }

  openImagePreview(selected: number) {
    this.resetError('pictures')
    ModalPresenter.present(this.$ionic, PicturesModal, {
      pictures: this.activity.pictures,
      selected,
      removable: true
    }).then(({data}) => {
      if (data) {
        if (this.activity.id) {
          this.removedPictures.push((this.activity.pictures[data.index] as Image).id)
        }
        this.activity.pictures.splice(data.index, 1)
        this.thumbnails.splice(data.index, 1)
      }
    })
  }

  runAutoGrow() {
    (this.$refs['desc'] as HTMLIonTextareaElement).getInputElement()
        .then(textarea => {
          textarea.style.height = 'auto'
          textarea.style.height = textarea.scrollHeight + 'px';
          (this.$refs['desc'] as HTMLIonTextareaElement).style.height = textarea.scrollHeight + 'px'
        })
  }

  runAutoScroll() {
    (this.$refs['desc'] as HTMLIonTextareaElement).getInputElement()
        .then(textarea => {
          const fontSize = Number(window.getComputedStyle(textarea, null).getPropertyValue('font-size').replace('px', ''))
          const currentLine = textarea.value.substring(0, textarea.selectionStart).split('\n').length
          const scroll = fontSize * currentLine - fontSize
          if (scroll !== this.scroll) {
            (this.$refs['content'] as HTMLIonContentElement).scrollToPoint(0, fontSize * currentLine - fontSize, 500)
            this.scroll = scroll
          }
        })
  }

  change(field,
         value) {
    this.$set(this.activity, field, value)
  }

  picturesSelected(pictures: Blob[]) {
    this.$set(this.activity, 'pictures', [...this.activity.pictures, ...pictures])
    Promise.all(pictures.map(picture => resizePicture(picture, 256)))
        .then((resized) => this.$set(this, 'thumbnails', [...this.thumbnails, ...resized]))
  }

  resetError(field) {
    this.$set(this.errors, field, undefined)
  }

  showPublishAsModal() {
    ModalPresenter.present(this.$ionic, PublishAsModal, {
      user: userModule.getCurrentUser,
      groups: this.userAdminGroups.map(({group}) => group),
      initialValue: this.activity.group?.id,
      texts: {
        title: this.$t('publish-as'),
        cancel: this.$t('cancel'),
        accept: this.$t('accept')
      },
    }, 'publish-as-modal')
        .then(({data}) => {
          if (data === 'user') {
            this.activity.user = this.currentUser
            this.activity.group = null
            this.activity.taggedGroups = []
          } else {
            const group = (_.find(this.userAdminGroups, {group: {id: Number(data)}}) as UserGroup).group as Group
            if (_.find(this.activity.taggedGroups, {id: Number(data)})) {
              _.remove(this.activity.taggedGroups, {id: Number(data)})
            }
            this.fromGroup = group.id
            this.$set(this.activity, 'group', group)
            this.activity.user = null
          }
        })
  }

}
</script>
<style>

.fix-label {
  margin-top: -4px;
}

.ios .item-has-focus .fix-label, .ios .item-has-value .fix-label {
  margin-bottom: -8px;
  margin-top: 6px;
}

.publish-label {
  margin-top: -0.5em !important;
}

.liters.ios .picker-columns .sc-ion-picker-ios:nth-child(2),
.liters.ios .picker-columns .sc-ion-picker-ios:nth-child(4) {
  flex-grow: 1.5;
}

.liters.ios .picker-columns .sc-ion-picker-ios:nth-child(2) .picker-opt {
  padding-left: 15px;
}

.liters.ios .picker-columns .sc-ion-picker-ios:nth-child(4) .picker-opt {
  padding-right: 15px;
}

ion-input[readonly = "true"] {
  text-overflow: ellipsis;
}

.no-value .label-floating.sc-ion-label-md-h {
  transform: translate3d(0, 100%, 0) scale(1);
}
</style>
