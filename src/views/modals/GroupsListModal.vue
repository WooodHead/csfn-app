<template>
  <div>
    <ion-header mode="ios">
      <ion-toolbar mode="ios">
        <ion-buttons slot="start">
          <ion-button @click="close">
            <ion-icon slot="icon-only" color="dark" name="arrow-back"/>
          </ion-button>
        </ion-buttons>

        <ion-title>
          {{ title }}
        </ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-list lines="full">
        <ion-item v-for="group in groups" :key="group.id" @click="openGroup(group)" button>
          <ion-avatar slot="start">
            <img :src="group.picture && group.picture.publicUrl || '/img/user-placeholder.png'">
          </ion-avatar>
          <ion-label class="mr-2 font-bold ios:my-5">{{ group.name }}</ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  </div>
</template>
<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator'
import Group from '@/types/Group'
import {groupsModule} from '@/store/groupsModule'

@Component({name: 'GroupsListModal'})
export default class GroupsListModal extends Vue {

  @Prop()
  title: string

  @Prop()
  groups: Group[]

  @Prop()
  $router: any

  close() {
    this.$ionic.modalController.dismiss()
  }

  openGroup(group) {
    groupsModule.setCurrentGroup(group)
    this.$router.push('/group/' + group.id)
        .then(() => {
          setTimeout(() => this.close(), 300)
        })
  }
}
</script>