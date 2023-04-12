<template>
  <ion-page>
    <ion-header mode="ios">
      <ion-toolbar mode="ios">
        <ion-buttons slot="start">
          <ion-button fill="clear" shape="round" @click="$router.back()">
            <ion-icon name="arrow-back" color="dark"></ion-icon>
          </ion-button>
        </ion-buttons>

        <ion-title>{{ $t('station') }}</ion-title>

        <ion-buttons slot="end" v-if="station && station.id">
          <ion-button fill="clear" shape="round" @click="remove" color="danger">
            <ion-label>{{ $t('remove') }}</ion-label>
          </ion-button>
        </ion-buttons>

      </ion-toolbar>
    </ion-header>

    <ion-content ref="content">
      <ion-list v-if="station" :style="{marginBottom: (this.keyboardHeight || 0) + 'px'}" class="pb-8">
        <!-- PICTURES -->
        <input-item :errors="errors['pictures']" no-lines item-class="item-no-padding">
          <ion-row v-if="station.pictures" class="w-full my-2 px-2">
            <ion-col v-for="i of [0,1,2,3,4]" :key="i">
              <upload-button :file="thumbnails[i]" :max="5 - station.pictures.length"
                             :url="station.pictures[i] && station.pictures[i].publicUrl"
                             @click="resetErrors('pictures') || station.pictures[i] && openImagePreview(i)"
                             @select="picturesSelected"></upload-button>
            </ion-col>
          </ion-row>
        </input-item>
        <input-item :label="$t('model')" :errors="errors['model']"
                    @focus="resetErrors('model', 'coords', 'street', 'postalCode', 'city', 'state', 'country')">
          <ion-select @ionChange="selectedModel = +$event.detail.value" :value="selectedModel"
                      @focus="resetErrors('model')">
            <ion-select-option v-for="model in models" :value="model.id" :key="model.id">
              {{ model.name }}
            </ion-select-option>
          </ion-select>
        </input-item>
        <input-item :label="$t('name')" v-model="station.name" :errors="errors['name']" @focus="resetErrors('name')"/>
        <input-item :label="$t('description')" v-model="station.description" :errors="errors['description']"
                    @focus="resetErrors('description')">
          <grow-textarea v-model="station.description" :content="$refs['content']"/>
        </input-item>
        <transition name="fade">
          <div v-if="selectedModel">
            <ion-list-header class="mt-4">
              <ion-label>{{ $t('location') }}</ion-label>
            </ion-list-header>

            <input-item :errors="errors['coords']">
              <div class="relative overflow-hidden ion-activatable rounded-xl mb-3" @click="openLocationSelection">
                <div
                    class="absolute w-full h-full top-0 left-0 flex justify-center items-center flex-col z-10 bg-gray-100"
                    v-if="!station.location.address">
                  <ion-icon icon="location-sharp" class="text-3xl opacity-75"/>
                  <span class="opacity-75 mt-2">{{ $t('set-pin') }}</span>
                  <ion-ripple-effect/>
                </div>
                <community-map :pins="[station.location.coords || coords]" :pin-type="type" class="m-0" :height="250"/>
              </div>
            </input-item>


          </div>

        </transition>

        <transition name="fade">
          <div v-if="station.location.address">
            <input-item :label="$t('street')" v-model="station.location.address.street" @focus="resetErrors('street')"
                        :errors="errors['street']"/>
            <input-item :label="$t('postalCode')" v-model="station.location.address.postalCode"
                        @focus="resetErrors('postalCode')" :errors="errors['postalCode']"/>
            <input-item :label="$t('city')" v-model="station.location.address.city" @focus="resetErrors('city')"
                        :errors="errors['city']"/>
            <input-item :label="$t('state')" v-model="station.location.address.state" @focus="resetErrors('state')"
                        :errors="errors['state']"/>
            <input-item :label="$t('country')" v-model="station.location.address.country">
              <ion-select :value="station.location.address.countryCode" @ionChange="setCountry($event.detail.value)">
                <ion-select-option v-for="country in countries" :key="country.code" :value="country.code">
                  {{ country.emoji }}&nbsp;&nbsp;{{ country.name }}
                </ion-select-option>
              </ion-select>
            </input-item>
          </div>
        </transition>
      </ion-list>
    </ion-content>
    <ion-footer>
      <ion-toolbar class="px-2 pb-safe ios:pt-2">
        <ion-button class="sm:w-2/3 lg:w-1/2 m-auto" color="primary" fill="solid" shape="round" size="block"
                    @click="save">
          {{ $t('save') }}
        </ion-button>
      </ion-toolbar>
    </ion-footer>
  </ion-page>
</template>
<script lang="ts">
import {Component, Vue} from 'vue-property-decorator'
import RecyclingStation from '@/types/RecyclingStation'
import {recyclingStationsProvider} from '@/providers/data/recycling-stations.provider'
import UploadButton from '@/views/components/common/UploadButton.vue'
import {resizePicture} from '@/tools/ImageProcessor'
import ModalPresenter from '@/tools/ModalPresenter'
import PicturesModal from '@/views/modals/PicturesModal.vue'
import Image from '@/types/Image'
import InputItem from '@/views/components/common/InputItem.vue'
import {groupsModule} from '@/store/groupsModule'
import {GroupCapability} from '@/types/GroupCapability'
import {groupRecyclingModule} from '@/store/groupRecyclingModule'
import GrowTextarea from '@/views/components/common/GrowTextarea.vue'
import LocationModal from '@/views/modals/SelectCleanupLocationModal.vue'
import {placesProvider} from '@/providers/places/places.provider'
import {locationModule} from '@/store/locationModule'
import _ from 'lodash'
import RecyclingType from '@/types/RecyclingType'
import FullAddress from '@/types/FullAddress'
import FullAddressLocation from '@/types/FullAddressLocation'
import CommunityMap from '@/views/components/community/CommunityMap.vue'
import Validator from '@/tools/Validator'
import {plainToClass} from 'class-transformer'
import ToastPresenter from '@/tools/ToastPresenter'
import FormError from '@/types/errors/FormError'
import ErrorMessage from '@/tools/ErrorMessage'
import UnknownError from '@/types/errors/UnknownError'
import {countries} from 'countries-list'
import {Keyboard, KeyboardInfo} from '@capacitor/keyboard'
import {askConfirmation} from '@/tools/askConfirmation'
import {appModule} from '@/store/appModule'

@Component({
  name: 'station-form-page',
  components: {CommunityMap, GrowTextarea, InputItem, UploadButton}
})
export default class StationFormPage extends Vue {

  KEY = process.env.VUE_APP_GOOGLE_API_KEY

  loading = false
  errors = {}
  station: RecyclingStation = null
  thumbnails: (Blob | string)[] = []
  removedPictures: number[] = []
  keyboardHeight = 0

  get coords() {
    return locationModule.getCoords
  }

  get address() {
    return locationModule.getAddress
  }

  get currentGroup() {
    return groupsModule.getCurrentGroup
  }

  get models() {
    return groupRecyclingModule.currentGroupStationModels
  }

  get selectedModel() {
    return this.station?.model?.id
  }

  set selectedModel(id) {
    this.station.model = _.find(this.models, {id})
  }

  get type() {
    return (this.station?.model?.types[0] as RecyclingType)?.id
  }

  get countries() {
    return _.sortBy(Object.entries(countries).map(([code, country]) => ({
      code,
      name: country.name,
      emoji: country.emoji
    })), (c) => c.name)
  }

  async created() {
    Keyboard.addListener('keyboardWillShow', (info: KeyboardInfo) => {
      this.keyboardHeight = info.keyboardHeight
    })
    Keyboard.addListener('keyboardWillHide', () => {
      this.keyboardHeight = 0
    })

    const groupId = +this.$route.params.groupId

    const id = this.$route.params.id

    if (!this.currentGroup) {
      await groupsModule.fetchGroup(+groupId)
    }

    if (this.currentGroup.capabilities.includes(GroupCapability.RECYCLING_STATION_MANUFACTURER)) {
      await groupRecyclingModule.fetchCurrentGroupStationModels(+groupId)
    }

    if (id === 'new') {
      this.station = {
        name: '',
        pictures: [],
        description: '',
        model: null,
        owner: {id: groupId},
        location: {
          address: null,
          coords: null
        }
      }
    } else {
      this.station = await recyclingStationsProvider.findOne(+id)
      this.thumbnails = (this.station.pictures as Image[]).map(({publicUrl}) => publicUrl)
    }
  }

  async save() {
    await appModule.showLoader(this.$ionic)
    this.loading = true
    try {
      await Validator.validate(plainToClass(RecyclingStation, this.station))
      if (this.station.id) {
        await this.update()
      } else {
        await this.create()
      }
      ToastPresenter.present(this.$ionic, this.$t(this.station.id ? 'updated' : 'created').toString(), 'success')
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
      this.loading = false
    }
  }

  async create() {
    await groupRecyclingModule.createStation(this.station)
  }

  async update() {
    await groupRecyclingModule.updateStation({station: this.station, removedPictures: this.removedPictures})
  }

  remove() {
    askConfirmation(this.$ionic,
        this.$t('remove-station').toString(),
        this.$t('confirmation-message', [this.$t('remove-station').toString().toLowerCase()]).toString(), this.$t('yes').toString(), this.$t('cancel').toString())
        .then(async () => {
          this.loading = true
          try {
            await recyclingStationsProvider.remove(this.station.id)
            ToastPresenter.present(this.$ionic, this.$t('removed').toString(), 'success')
            this.$router.back()
          } catch (error) {
            ToastPresenter.present(this.$ionic, ErrorMessage.getMessage(error))
          }
          this.loading = false
        })
  }

  setCountry(code) {
    this.station.location.address.countryCode = code
    this.station.location.address.country = countries[code].name
  }

  picturesSelected(pictures: Blob[]) {
    this.$set(this.station, 'pictures', [...this.station.pictures, ...pictures])
    Promise.all(pictures.map(picture => resizePicture(picture, 256)))
        .then((resized) => this.$set(this, 'thumbnails', [...this.thumbnails, ...resized]))
  }

  openImagePreview(selected: number) {
    this.resetErrors('pictures')
    ModalPresenter.present(this.$ionic, PicturesModal, {
      pictures: this.station.pictures,
      selected,
      removable: true
    }).then(({data}) => {
      if (data) {
        if (this.station.id && (this.station.pictures[data.index] as Image).id) {
          this.removedPictures.push((this.station.pictures[data.index] as Image).id)
        }
        this.station.pictures.splice(data.index, 1)
        this.thumbnails.splice(data.index, 1)
      }
    })
  }

  openLocationSelection() {
    if (!this.selectedModel) return
    this.resetErrors('coords')
    ModalPresenter.present(this.$ionic, LocationModal, {
      currentCoords: this.station.location?.coords || this.coords,
      currentAddress: this.station.location?.address || this.address,
      searchPlaceholder: this.$t('search-place'),
      cancelText: this.$t('cancel'),
      acceptText: this.$t('confirm'),
      pin: `/img/pin_${this.type}.png`
    }).then(({data}) => {
      if (data) {
        placesProvider.getAddress(data.selectedCoords, true)
            .then((address: FullAddress) => {
              this.$set(this.station, 'location', new FullAddressLocation(address, data.selectedCoords));
              (this.$refs['content'] as HTMLIonContentElement).scrollToPoint(0, 999999, 100)
            })
      }
    })
  }

  resetErrors(...fields) {
    fields.forEach(field => this.$set(this.errors, field, undefined))
  }
}
</script>