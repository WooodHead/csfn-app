<template>
  <ion-page>
    <ion-header mode="ios">
      <ion-toolbar mode="ios">
        <ion-buttons slot="start">
          <ion-button fill="clear" shape="round" @click="$router.back()">
            <ion-icon name="arrow-back" color="dark"></ion-icon>
          </ion-button>
        </ion-buttons>

        <ion-title>{{ $t('station-model') }}</ion-title>

        <ion-buttons slot="end" v-if="model && model.id">
          <ion-button fill="clear" shape="round" @click="remove" color="danger">
            <ion-label>{{ $t('remove') }}</ion-label>
          </ion-button>
        </ion-buttons>

      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-list class="p-0 mb-8" v-if="model">
        <input-item :errors="errors['name']" v-model="model.name" :label="$t('name')" @focus="errors['name'] = []"/>
        <input-item :errors="errors['types']" :label="$t('recycling-types')">
          <ion-select :value="type" @ionChange="type = $event.detail.value"
                      @focus="errors['types'] = []">
            <ion-select-option v-for="type in allTypes" :key="type.id" :value="type.id">
              {{ type.name[$i18n.locale] }}
            </ion-select-option>
          </ion-select>
        </input-item>
      </ion-list>

      <ion-button class="w-2/3 lg:w-1/2 m-auto" color="primary" fill="solid" shape="round" size="block"
                  @click="save" :disabled="loading">
        {{ $t('save') }}
      </ion-button>
    </ion-content>
  </ion-page>
</template>
<script lang="ts">
import InputItem from '@/views/components/common/InputItem.vue'
import {Component, Vue} from 'vue-property-decorator'
import {recyclingTypesProvider} from '@/providers/data/recycling-types.provider'
import RecyclingStationModel from '@/types/RecyclingStationModel'
import {recyclingStationModelsProvider} from '@/providers/data/recycling-station-models.provider'
import Validator from '@/tools/Validator'
import {plainToClass} from 'class-transformer'
import FormError from '@/types/errors/FormError'
import ErrorMessage from '@/tools/ErrorMessage'
import UnknownError from '@/types/errors/UnknownError'
import ToastPresenter from '@/tools/ToastPresenter'
import {askConfirmation} from '@/tools/askConfirmation'
import {RecyclingTypeId} from '@/types/RecyclingType'

@Component({
  name: 'station-model-form-page',
  components: {InputItem}
})
export default class StationModelFormPage extends Vue {

  id: number = null
  errors = {}
  model: RecyclingStationModel = null
  allTypes = []
  loading = false

  get type(): RecyclingTypeId {
    return this.model?.types?.[0] as RecyclingTypeId
  }

  set type(type) {
    this.model.types = [type]
  }

  async created() {
    this.allTypes = await recyclingTypesProvider.findAll()

    const groupId = +this.$route.params.groupId

    const id = this.$route.params.id

    if (id === 'new') {
      this.model = {
        name: '',
        types: [],
        manufacturer: {id: groupId}
      }
    } else {
      this.model = await recyclingStationModelsProvider.findOne(+id)
    }

  }

  async save() {
    this.loading = true
    try {
      await Validator.validate(plainToClass(RecyclingStationModel, this.model))
      if (this.model.id) {
        await this.update()
      } else {
        await this.create()
      }
      ToastPresenter.present(this.$ionic, this.$t(this.model.id ? 'updated' : 'created').toString(), 'success')
      this.$router.back()
    } catch (error) {
      console.log(error)
      if (error instanceof FormError) {
        error.fieldErrors.forEach((error) => {
          this.$set(this.errors, error.param, [ErrorMessage.getMessage(error)])
        })
      } else if (error instanceof UnknownError) {
        ToastPresenter.present(this.$ionic, ErrorMessage.getMessage(error))
      }
    } finally {
      this.loading = false
    }
  }

  async create() {
    await recyclingStationModelsProvider.create(this.model)
  }

  async update() {
    await recyclingStationModelsProvider.update(this.model)
  }

  async remove() {
    askConfirmation(this.$ionic,
        this.$t('remove-station-model').toString(),
        this.$t('confirmation-message', [this.$t('remove-station-model').toString().toLowerCase()]).toString(), this.$t('yes').toString(), this.$t('cancel').toString())
        .then(async () => {
          this.loading = true
          try {
            await recyclingStationModelsProvider.remove(this.model.id)
            ToastPresenter.present(this.$ionic, this.$t('removed').toString(), 'success')
            this.$router.back()
          } catch (error) {
            ToastPresenter.present(this.$ionic, ErrorMessage.getMessage(error))
          }
          this.loading = false
        })
  }

}
</script>