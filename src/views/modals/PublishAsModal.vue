<template>
  <div>
    <ion-header mode="ios">
      <ion-toolbar mode="ios">
        <ion-buttons slot="start">
          <ion-button @click="cancel" color="primary">{{ texts['cancel'] }}</ion-button>
        </ion-buttons>
        <ion-title>{{ texts['title'] }}</ion-title>
        <ion-buttons slot="end">
          <ion-button color="primary" @click="accept">
            {{ texts['accept'] }}
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-list lines="full">
        <ion-radio-group :value="selected" @ionChange="selected = $event.target.value">
          <ion-item mode="md">
            <ion-avatar slot="start">
              <img :src="user.picture.publicUrl"/>
            </ion-avatar>
            <ion-label class="font-bold">{{ user.username }}</ion-label>
            <ion-radio value="user" mode="md"></ion-radio>
          </ion-item>
          <ion-item v-for="group in groups" :key="group.id" mode="md">
            <ion-avatar slot="start">
              <img :src="group.picture.publicUrl"/>
            </ion-avatar>
            <ion-label class="font-bold">{{ group.name }}</ion-label>
            <ion-radio :value="group.id" mode="md"></ion-radio>
          </ion-item>
        </ion-radio-group>
      </ion-list>
    </ion-content>
  </div>
</template>
<script lang="ts">
import {Prop, Vue} from 'vue-property-decorator'
import Component from 'vue-class-component'
import Group from '@/types/Group'
import User from '@/types/User'

@Component({
  name: 'PublishAsModal'
})
export default class PublishAsModal extends Vue {

  @Prop(Object)
  texts: { title: string, cancel: string, accept: string }

  @Prop(Object)
  user: User

  @Prop(Array)
  groups: Group[]

  @Prop(String)
  initialValue: string

  selected = 'user'

  mounted() {
    if (this.initialValue) {
      this.selected = this.initialValue
    }
  }

  cancel() {
    this.$ionic.modalController.dismiss()
  }

  accept() {
    this.$ionic.modalController.dismiss(this.selected)
  }
}
</script>