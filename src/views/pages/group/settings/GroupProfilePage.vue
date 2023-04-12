<template>
  <ion-page>
    <ion-header mode="ios">
      <ion-toolbar mode="ios">
        <ion-buttons slot="start">
          <ion-button fill="clear" shape="round" @click="$router.back()">
            <ion-icon name="arrow-back" color="dark"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>
          <span class="flex items-center justify-center">
          <ion-icon slot="start" :src="require('ionicons5/dist/svg/brush-outline.svg')" color="back"
                    class="mr-2 -ml-2"/>
          {{ $t('group-profile') }}
          </span>
        </ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="h-48 mt-4 mx-4 rounded-xl overflow-hidden" v-if="edition">
        <upload-button :url="edition.cover && edition.cover.publicUrl" @select="newCover = $event[0]" :file="newCover"
                       class="h-48" overwrite>
          <cover-placeholder v-if="!edition.cover && !newCover" :image="edition.picture.publicUrl"/>
          <div class="absolute m-4 top-0 right-0 w-8 text-lg h-8 p-1 rounded-full flex items-center justify-center"
               style="z-index: 5; background: rgba(0,0,0,0.25)">
            <ion-icon name="pencil-sharp" color="white"></ion-icon>
          </div>
        </upload-button>
      </div>

      <div class="mx-auto w-32 -mt-16 rounded-full shadow-md" v-if="edition">
        <upload-button :rounded="true" :url="group.picture && group.picture.publicUrl" :file="newPicture"
                       @select="newPicture = $event[0]" overwrite :disabled="updateRequest && updateRequest.picture"/>
      </div>

      <ion-note class="flex mt-2 opacity-75 mb-4 justify-center w-full" v-if="updateRequest && updateRequest.picture">
        <ion-icon name="information-circle" class="mr-1 -ml-2"></ion-icon>
        <span class=" font-bold text-xs">{{ $t('pending-approval') }}</span>
      </ion-note>

      <div v-if="edition" class="pb-8 mt-4">
        <input-item v-model="name" :errors="errors['name']" :label="$t('name')"
                    :messages="hasUpdateField('name') ? [$t('pending-approval')] : []"
                    @focus="resetError('name')"
                    :disabled="hasUpdateField('name')"></input-item>

        <input-item v-model="edition.mission" :errors="errors['mission']" :label="$t('mission')"
                    @focus="resetError('mission')"></input-item>

        <input-item :errors="errors['description']" :slotted-input="$refs['desc']"
                    @focus="resetError('description')" :label="$t('description')">
          <ion-textarea ref="desc" :value="edition.description"
                        maxlength="1024" rows="3" @click="runAutoScroll"
                        @ionChange="runAutoGrow() || (() => edition.description = $event.target.value)()"></ion-textarea>
        </input-item>

        <input-item v-model="instagram" :errors="errors['instagram']" :label="$t('instagram')"
                    @focus="resetError('instagram')" :disabled="hasUpdateField('instagram')"
                    :messages="hasUpdateField('instagram') ? [$t('pending-approval')] : []"
                    :icon-src="require('ionicons5/dist/svg/logo-instagram.svg')"></input-item>

        <input-item v-model="web" :errors="errors['web']" :label="$t('web')"
                    :disabled="hasUpdateField('web')"
                    :messages="hasUpdateField('web') ? [$t('pending-approval')] : []"
                    @focus="resetError('web')" :icon-src="require('ionicons5/dist/svg/globe-outline.svg')"></input-item>

      </div>

      <div :style="`height: ${keyboardHeight}px`"></div>
    </ion-content>

    <ion-footer>
      <ion-toolbar>
        <ion-button class="sm:w-2/3 lg:w-1/2 m-auto" shape="round" size="block" @click="save">
          {{ $t('save') }}
        </ion-button>
      </ion-toolbar>
    </ion-footer>

  </ion-page>
</template>
<script lang="ts">
import Component from 'vue-class-component'
import {Vue} from 'vue-property-decorator'
import {groupsModule} from '@/store/groupsModule'
import CoverPlaceholder from '@/views/components/common/CoverPlaceholder.vue'
import UploadButton from '@/views/components/common/UploadButton.vue'
import InputItem from '@/views/components/common/InputItem.vue'
import Group from '@/types/Group'
import {appModule} from '@/store/appModule'
import Validator from '@/tools/Validator'
import {plainToClass} from 'class-transformer'
import FormError from '@/types/errors/FormError'
import ErrorMessage from '@/tools/ErrorMessage'
import UnknownError from '@/types/errors/UnknownError'
import ToastPresenter from '@/tools/ToastPresenter'
import {imagesProvider} from '@/providers/data/images.provider'
import {GroupUpdateRequest} from '@/types/GroupUpdateRequest'
import {Keyboard, KeyboardInfo} from '@capacitor/keyboard'

@Component({
  name: 'GroupProfilePage',
  components: {CoverPlaceholder, UploadButton, InputItem}
})
export default class GroupProfilePage extends Vue {

  id: number = null
  newCover = null
  newPicture = null
  edition: Group = null
  errors = {}
  scroll = 0
  updateRequest: GroupUpdateRequest = null
  keyboardHeight = null

  get group() {
    return groupsModule.getCurrentGroup
  }

  get name() {
    return this.updateRequest?.name || this.group.name
  }

  set name(value) {
    this.edition.name = value
  }

  get instagram() {
    return this.updateRequest?.instagram || this.group.instagram
  }

  set instagram(value) {
    this.edition.instagram = value
  }

  get web() {
    return this.updateRequest?.web || this.group.web
  }

  set web(value) {
    this.edition.web = value
  }

  mounted() {
    this.id = +this.$route.params.id
    this.fetch()
    Keyboard.addListener('keyboardWillShow', (info: KeyboardInfo) => {
      this.keyboardHeight = info.keyboardHeight
    })
    Keyboard.addListener('keyboardWillHide', () => {
      this.keyboardHeight = 0
    })
  }

  fetch() {
    groupsModule.fetchGroup(this.id)
        .then(() => this.edition = this.group)
        .then(() => groupsModule.fetchGroupRequests())
        .then((request) => this.updateRequest = request || null)
        .catch(() => undefined)
  }

  save() {
    appModule.showLoader(this.$ionic)
        .then(() => Validator.validate(plainToClass(Group, this.edition, {strategy: 'excludeAll'})))
        .then(() => this.newPicture ? imagesProvider.uploadImages([this.newPicture], 'update-the-group')
            .then(([picture]) => this.edition.picture = picture) : Promise.resolve() as any)
        .then(() => this.newCover ? imagesProvider.uploadImages([this.newCover], 'update-the-group')
            .then(([cover]) => this.edition.cover = cover) : Promise.resolve() as any)
        .then(() => groupsModule.updateGroup({...this.edition, category: null, recyclingStats: undefined}))
        .then(() => {
          this.fetch()
          ToastPresenter.present(this.$ionic, this.$t('group-updated'), 'success')
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
        .finally(() => appModule.hideLoader())
  }

  resetError(field) {
    delete this.errors[field]
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

  hasUpdateField(field) {
    return !!this.updateRequest?.[field]
  }
}
</script>