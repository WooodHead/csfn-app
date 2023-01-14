<template>
  <div :class="rounded ? 'rounded' : ''" class="picture-button w-full ion-activatable ripple-parent" @click="click">
    <div class="disabled-overlay absolute w-full h-full top-0 left-0 z-50" v-if="disabled">

    </div>
    <div class="w-full h-full absolute">
      <div v-if="isMobile" class="w-full h-full absolute cursor-pointer z-10" @click="getPicture"></div>
      <label v-else class="w-full h-full absolute cursor-pointer z-10">
        <input accept=".png,.jpg" class="hidden" name="file" type="file" v-if="!file || overwrite"
               @change="filesSelected([$event.target.files[0]])">
      </label>
      <slot/>
      <ion-spinner v-if="loading" class="absolute w-full h-full opacity-50 z-50" color="primary"
                   name="crescent"></ion-spinner>
      <div class="z-1 w-full h-full">
        <img v-if="file || url" :src="fileUrl || url" alt="Cleanup picture" class="absolute w-full h-full"
             :class="{'opacity-75': disabled}">
        <div v-else class="background w-full h-full"></div>
      </div>
    </div>
    <ion-ripple-effect></ion-ripple-effect>
  </div>
</template>
<script lang="ts">
import PhotoPermissions from '@/plugins/PhotoPermissions'
import {nativeProvider} from '@/providers/native/native.provider'
import {ImagePicker} from '@ionic-native/image-picker'
import Vue from 'vue'
import Component from 'vue-class-component'
import {Emit, Prop} from 'vue-property-decorator'

@Component({
  name: 'upload-button'
})
export default class UploadButton extends Vue {

  isMobile = false

  @Prop(Boolean)
  rounded: boolean

  @Prop(Boolean)
  overwrite: boolean

  @Prop(Boolean)
  disabled: boolean

  loading = false

  @Prop()
  file: any

  @Prop({default: 1})
  max: number

  @Prop(String)
  url: string

  get fileUrl() {
    return this.file && (typeof this.file === 'string' ? this.file : URL.createObjectURL(this.file))
  }

  mounted() {
    nativeProvider.isMobile()
        .then((isMobile) => this.isMobile = isMobile)
  }

  getPicture() {
    if (this.file && !this.overwrite) {
      return
    }
    this.loading = true

    nativeProvider.isIOS()
        .then(isIOS => isIOS ? PhotoPermissions.check({
          acceptText: this.$t('accept').toString(),
          cancelText: this.$t('cancel').toString(),
          deniedText: this.$t('photo-denied-access').toString(),
          limitedText: this.$t('photo-limited-access').toString(),
          selectMoreText: this.$t('photo-select-more').toString(),
          keepText: this.$t('photo-keep').toString(),
          selectAllText: this.$t('photo-select-all').toString()
        }) : Promise.resolve({next: true}))
        .then(({next}) => next && ImagePicker.getPictures({
              maximumImagesCount: this.max,
              width: 1024,
              quality: 90,
              outputType: 1
            }).then((images: string[]) => Promise.all(images.map((image) =>
                fetch('data:image/jpeg;base64,' + image).then((res) => res.blob())))
            ).then((blobs: Blob[]) => {
              this.filesSelected(blobs)
            })
        )
        .catch((err) => {
          console.log(err)
        })
        .finally(() => {
          this.loading = false
        })
  }

  @Emit('select')
  filesSelected(files: Blob[]) {
    return files
  }

  @Emit('click')
  click() {
    return
  }

}
</script>
<style>
.picture-button {
  border-radius: 1rem;
}

.picture-button.rounded {
  background-color: #eee;
  border: 4px solid #fff;
  border-radius: 50%;
}

.picture-button .background {
  background: url("/add-picture.png") center center/cover;
  border: 2px dashed #b0b0b0;
  border-radius: 1rem;
}

.picture-button.rounded .background {
  border: none;
  border-radius: 50%;
}

.picture-button:after {
  content: '';
  display: block;
  padding-top: 100%;
}

.picture-button img {
  object-fit: cover;
  object-position: center center;
}

.disabled-overlay {

}
</style>
