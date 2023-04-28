<template>
  <ion-page>
    <ion-header mode="ios">
      <ion-toolbar mode="ios">
        <ion-buttons slot="start">
          <ion-button shape="round" fill="clear" @click="dismiss(false)">
            <ion-icon name="arrow-back"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>
          {{ name }}
        </ion-title>

        <ion-buttons slot="end">
          <ion-button shape="round" fill="clear" @click="download">
            <ion-icon :src="require('ionicons5/dist/svg/download-outline.svg')"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="flex h-full w-full items-center justify-center p-4">
        <div class="w-full" id="qr-code" ref="qrCode"></div>
      </div>
    </ion-content>
  </ion-page>
</template>
<script lang="ts">

import {Component, Prop, Vue} from 'vue-property-decorator'
import QRCodeStyling from 'qr-code-styling'
import {Directory, Filesystem} from '@capacitor/filesystem'
import {FileOpener} from '@capacitor-community/file-opener'
import {blobToBase64} from 'base64-blob'

@Component({
  name: 'recycling-station-qr',
  components: {}
})
export default class RecyclingStationQR extends Vue {

  @Prop(String)
  name: string

  @Prop(Number)
  id: number

  @Prop()
  ionic

  qrCode

  mounted() {
    this.qrCode = new QRCodeStyling(
        {
          'width': 512,
          'height': 512,
          'data': 'https://cleansomethingfornothing.com/app/edit-recycling?stationId=' + this.id,
          'margin': 10,
          'qrOptions': {'typeNumber': 0, 'mode': 'Byte', 'errorCorrectionLevel': 'Q'},
          'imageOptions': {'hideBackgroundDots': true, 'imageSize': 0.4, 'margin': 30},
          'dotsOptions': {'type': 'rounded', 'color': '#59b14a'},
          'backgroundOptions': {'color': '#ffffff'},
          'image': '/favicon/android-chrome-192x192.png',
          'cornersSquareOptions': {'type': null, 'color': '#59b14a'},
          'cornersDotOptions': {'type': null, 'color': '#59b14a'},
        }
    )
    this.qrCode.append(this.$refs['qrCode'])
  }

  dismiss(updated: boolean) {
    this.ionic.modalController.dismiss(updated)
  }

  async download() {
    const data = await blobToBase64(await this.qrCode.getRawData('png'))
    const path = 'Download/' + this.name.replace(/\s/g, '_') + '_QR.png'
    const result = await Filesystem.writeFile({
      path,
      data,
      directory: Directory.ExternalStorage
    })

    await FileOpener.open({filePath: result.uri})
  }

}

</script>
<style>
#qr-code canvas {
  width: 100%;
}
</style>