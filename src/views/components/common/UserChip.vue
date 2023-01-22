<template>
  <ion-chip class="ml-0 mr-0" color="dark">
    <!--@click="$router.push('/user/' + activity.user.username)"-->
    <ion-avatar>
      <img :src="picture">
    </ion-avatar>
    <ion-label class="mr-2 font-bold">{{ username }}</ion-label>
    <ion-icon v-if="removable" name="close-circle" @click="remove"></ion-icon>
    <ion-icon v-if="endIcon" :name="endIcon" class="-ml-1"/>
  </ion-chip>
</template>
<script lang="ts">
import {Component, Emit, Prop, Vue} from 'vue-property-decorator'
import User from '@/types/User'

@Component({
  name: 'UserChip'
})
export default class UserChip extends Vue {

  @Prop(Object)
  user?: User

  @Prop(Boolean)
  removable?: boolean

  @Prop(String)
  endIcon: string


  @Emit('remove')
  remove() {
    return
  }

  get username() {
    return this.user?.username || 'Anonymous'
  }

  get picture() {
    return this.user?.picture?.publicUrl || '/img/user-placeholder.png'
  }

}
</script>