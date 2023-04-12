<template>
  <ion-page class="ion-page absolute">
    <ion-header mode="ios">
      <ion-toolbar mode="ios">
        <ion-buttons slot="start">
          <ion-button color="dark" fill="clear" shape="round" @click="$router.back()">
            <ion-icon slot="icon-only" name="arrow-back"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>
          {{ $t(recycling && recycling.id ? 'edit' : 'publish') }} {{ $t('recycling').toLowerCase() }}
        </ion-title>
        <ion-buttons v-if="recycling && recycling.id" slot="end">
          <ion-button color="danger" fill="clear" shape="round" @click="remove">
            {{ $t('remove') }}
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content ref="content">
      <form class="lg:px-16 xl:px-40 bg-white" :style="{marginBottom: (this.keyboardHeight || 0) + 'px'}">
        <ion-list v-if="recycling" class="p-0 pb-16" lines="full">

          <ion-item color="blue" class="mb-2 opacity-90">
            <ion-icon icon="location-sharp" slot="start"/>
            <ion-label>
              <h3>
                <span class="font-bold">{{ station.name }}</span>
              </h3>
              <p>
                {{ station.location.address.street }}, {{ station.location.address.city }}
              </p>
            </ion-label>
          </ion-item>

          <!-- PICTURES -->
          <input-item :errors="errors['pictures']" no-lines item-class="item-no-padding">
            <ion-row v-if="recycling.pictures" class="w-full my-2 px-2">
              <ion-col v-for="i of [0,1,2,3,4]" :key="i">
                <upload-button :file="thumbnails[i]" :max="5 - recycling.pictures.length"
                               :url="recycling.pictures[i] && recycling.pictures[i].publicUrl"
                               @click="resetError('pictures') || recycling.pictures[i] && openImagePreview(i)"
                               @select="picturesSelected"></upload-button>
              </ion-col>
            </ion-row>
          </input-item>

          <!-- DESCRIPTION -->
          <input-item :errors="errors['description']" :slotted-input="$refs['desc']"
                      @focus="resetError('description')">
            <grow-textarea v-model="recycling.description" :content="$refs['content']"
                           :placeholder="$t('write-description')"/>
          </input-item>

          <!-- VOLUME -->
          <input-item :errors="errors['volume']"
                      :icon-src="require('@/assets/img/icons/bag.svg')"
                      :slotted-input="$refs.volume" @focus="resetError('volume')"
                      class="liters" end-note="Lt" type="number">
            <ion-label class="fix-label" position="floating">{{ $t('volume') }}</ion-label>
            <ion-input ref="volume" :value="item.volume" enterkeyhint="enter"
                       type="number" inputmode="numeric" debounce="500" @ionInput="volumeChanged(+$event.target.value)"
                       @ionChange="item.volume = +$event.target.value"></ion-input>
          </input-item>

          <!-- WEIGHT -->
          <input-item :errors="errors['weight']"
                      :icon-src="require('@/assets/img/icons/scale.svg')"
                      :slotted-input="$refs.weight"
                      end-note="Kg" @focus="resetError('weight')">
            <ion-label class="fix-label" position="floating">{{ $t('weight') }} <span
                class="text-xs">{{ automaticWeight ? $t('automatic-weight') : '' }}</span></ion-label>
            <ion-input ref="weight" :value="item.weight" enterkeyhint="enter" debounce="500"
                       @ionInput="weightChanged(+$event.target.value)"
                       type="number" inputmode="numeric"
                       @ionChange="item.weight = +$event.target.value"></ion-input>
          </input-item>

          <!-- COUNT -->
          <input-item :errors="errors['count']"
                      :slotted-input="$refs.count"
                      @focus="resetError('count')">
            <div class="bg-dark w-7 h-7 rounded-full text-center mr-3" slot="start">
              <fa-icon :icon="item.type.icon" slot="start" class="text-white text-sm"/>
            </div>
            <ion-label class="fix-label" position="floating">{{ item.type.name }}</ion-label>
            <ion-input ref="count" :value="item.count" enterkeyhint="enter"
                       type="number" inputmode="numeric" debounce="500"
                       @ionInput="countChanged(+$event.target.value)"
                       @ionChange="item.count = +$event.target.value"></ion-input>
          </input-item>

          <!-- DATE -->
          <input-item :errors="errors['date']"
                      icon="calendar"
                      @focus="resetError('date') || $refs.date.open()">
            <ion-label class="fix-label" position="floating">{{ $t('date') }}</ion-label>
            <ion-datetime ref="date" v-model="recycling.date" :max="today"
                          :readonly="true" :value="recycling.date" display-format="DD/MM/YYYY"
                          picker-format="DD MMMM YYYY" :month-names="monthNames"
                          @ionChange="change('date', new Date($event.target.value))"></ion-datetime>
          </input-item>

        </ion-list>
      </form>
    </ion-content>
    <ion-footer>
      <ion-toolbar class="px-2 pb-safe ios:pt-2">
        <ion-button class="sm:w-2/3 lg:w-1/2 m-auto" color="blue" fill="solid" shape="round" size="block"
                    @click="save">
          {{ $t('save') }}
        </ion-button>
      </ion-toolbar>
    </ion-footer>
  </ion-page>
</template>
<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import ModalPresenter from '@/tools/ModalPresenter'
import PicturesModal from '@/views/modals/PicturesModal.vue'
import UploadButton from '@/views/components/common/UploadButton.vue'
import FormError from '@/types/errors/FormError'
import ErrorMessage from '@/tools/ErrorMessage'
import InputError from '@/views/components/common/InputError.vue'
import InputItem from '@/views/components/common/InputItem.vue'
import {monthNames} from '@/tools/Utils'
import ToastPresenter from '@/tools/ToastPresenter'
import Validator from '@/tools/Validator'
import {appModule} from '@/store/appModule'
import UnknownError from '@/types/errors/UnknownError'
import {userModule} from '@/store/userModule'
import {resizePicture} from '@/tools/ImageProcessor'
import Image from '@/types/Image'
import {Keyboard, KeyboardInfo} from '@capacitor/keyboard'
import {plainToClass} from 'class-transformer'
import GrowTextarea from '@/views/components/common/GrowTextarea.vue'
import Recycling from '@/types/Recycling'
import {recyclingModule} from '@/store/recyclingModule'
import RecyclingItem from '@/types/RecyclingItem'
import RecyclingType from '@/types/RecyclingType'
import {askConfirmation} from '@/tools/askConfirmation'
import {recyclingsProvider} from '@/providers/data/recyclings.provider'

@Component({
  name: 'recycling-edition-page',
  components: {GrowTextarea, InputItem, InputError, UploadButton}
})
export default class RecyclingEditionPage extends Vue {

  errors = {}

  expandStation = false
  recycling: Recycling = null
  thumbnails: (Blob | string)[] = []
  previousPictures = []
  removedPictures: number[] = []
  automaticWeight = false
  keyboardHeight = 0

  volumeChanged(volume) {
    if (!volume) return
    const weight = +(this.type.unitsPerLiter * volume / this.type.unitsPerKilo).toFixed(2)
    const count = +(this.type.unitsPerLiter * volume).toFixed(2)
    if (this.item.weight !== weight) this.item.weight = weight
    if (this.item.count !== count) this.item.count = count
  }

  weightChanged(weight) {
    if (!weight) return
    const volume = +(this.type.unitsPerKilo * weight / this.type.unitsPerLiter).toFixed(2)
    const count = +(this.type.unitsPerKilo * weight).toFixed(2)
    if (this.item.volume !== volume) this.item.volume = volume
    if (this.item.count !== count) this.item.count = count
  }

  countChanged(count) {
    if (!count) return
    const weight = +(count / this.type.unitsPerKilo).toFixed(2)
    const volume = +(count / this.type.unitsPerLiter).toFixed(2)
    if (this.item.weight !== weight) this.item.weight = weight
    if (this.item.volume !== volume) this.item.volume = volume
  }

  get station() {
    return recyclingModule.station
  }

  get monthNames() {
    return monthNames[this.$i18n.locale]
  }

  get currentUser() {
    return userModule.getCurrentUser
  }

  get today() {
    return new Date().toISOString().split('T')[0]
  }

  get nextYear() {
    return new Date().getFullYear() + 1
  }

  get item(): RecyclingItem {
    return this.recycling?.items?.[0] || {volume: 0, count: 0, weight: 0, type: null}
  }

  set item(item) {
    this.recycling.items[0] = item
  }

  get type(): RecyclingType {
    return this.item.type as RecyclingType
  }

  async mounted() {
    const stationId = +this.$route.query.stationId
    if (!stationId || isNaN(stationId)) {
      this.$router.replace('/')
      return
    }
    await recyclingModule.fetchStation(stationId)

    if (!this.station) {
      this.$router.replace('/')
      return
    }

    if (this.$route.query.id) {
      this.recycling
    }

    this.$set(this, 'recycling', recyclingModule.recycling || {
      pictures: [],
      description: '',
      date: new Date(),
      station: this.station,
      items: this.station.model.types.map(type => ({
        type,
        count: null,
        volume: null,
        weight: null
      }))
    })
    if (this.recycling.id) {
      this.previousPictures = [...this.recycling.pictures]
      this.thumbnails = (this.recycling.pictures as Image[]).map(({publicUrl}) => publicUrl)
    }

    Keyboard.addListener('keyboardWillShow', (info: KeyboardInfo) => {
      this.keyboardHeight = info.keyboardHeight
    })
    Keyboard.addListener('keyboardWillHide', () => {
      this.keyboardHeight = 0
    })
  }

  beforeDestroy() {
    recyclingModule.setRecycling(null)
  }

  async save() {
    await appModule.showLoader(this.$ionic)
    try {
      await Validator.validate(plainToClass(Recycling, this.recycling))
      if (this.recycling.id) {
        await this.update()
      } else {
        await this.create()
      }
      ToastPresenter.present(this.$ionic, this.$t(this.recycling.id ? 'updated-recycling' : 'created-recycling').toString(), 'success')
      this.$router.back()
    } catch (error) {
      if (error instanceof FormError) {
        error.fieldErrors.forEach((error) => {
          this.$set(this.errors, error.param, [ErrorMessage.getMessage(error)])
        })
      } else if (error instanceof UnknownError) {
        ToastPresenter.present(this.$ionic, ErrorMessage.getMessage(error))
      }
    } finally {
      appModule.hideLoader()
    }
  }

  async create() {
    await recyclingModule.createRecycling({
      ...this.recycling,
      items: this.recycling.items.map(item => ({...item, type: (item.type as RecyclingType).id}))
    })
  }

  async update() {
    await recyclingModule.updateRecycling({
      recycling: {
        ...this.recycling,
        items: this.recycling.items.map(item => ({...item, type: (item.type as RecyclingType).id})),
      },
      removedPictures: this.removedPictures
    })
  }

  remove() {
    askConfirmation(this.$ionic,
        this.$t('remove-recycling').toString(),
        this.$t('confirmation-message', [this.$t('remove-recycling').toString().toLowerCase()]).toString(), this.$t('yes').toString(), this.$t('cancel').toString())
        .then(async () => {
          try {
            await recyclingsProvider.remove(this.recycling.id)

            ToastPresenter.present(this.$ionic, this.$t('removed').toString(), 'success')
            this.$router.go(-2)
          } catch (error) {
            ToastPresenter.present(this.$ionic, ErrorMessage.getMessage(error))
          }
        })
  }

  openImagePreview(selected: number) {
    this.resetError('pictures')
    ModalPresenter.present(this.$ionic, PicturesModal, {
      pictures: this.recycling.pictures,
      selected,
      removable: true
    }).then(({data}) => {
      if (data) {
        if (this.recycling.id && (this.recycling.pictures[data.index] as Image).id) {
          this.removedPictures.push((this.recycling.pictures[data.index] as Image).id)
        }
        this.recycling.pictures.splice(data.index, 1)
        this.thumbnails.splice(data.index, 1)
      }
    })
  }


  change(field,
         value) {
    this.$set(this.recycling, field, value)
  }

  picturesSelected(pictures: Blob[]) {
    this.$set(this.recycling, 'pictures', [...this.recycling.pictures, ...pictures])
    Promise.all(pictures.map(picture => resizePicture(picture, 256)))
        .then((resized) => this.$set(this, 'thumbnails', [...this.thumbnails, ...resized]))
  }

  resetError(field) {
    this.$set(this.errors, field, undefined)
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
