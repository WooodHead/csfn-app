<template>
  <ion-chip class="ml-0 mr-0" color="dark">
    <!--@click="$router.push('/user/' + activity.user.username)"-->
    <ion-avatar>
      <img :src="picture">
    </ion-avatar>
    <ion-label class="mr-2 font-bold">{{ username }}</ion-label>
    <ion-icon v-if="removable" name="close-circle" @click="remove"></ion-icon>
  </ion-chip>
</template>
<script lang="ts">
import {Component, Emit, Prop, Vue} from 'vue-property-decorator'
import User from '@/types/User'
import {i18n} from '@/i18n'

@Component({
  name: 'UserChip'
})
export default class UserChip extends Vue {

  @Prop(Object)
  user?: User

  @Prop(Boolean)
  removable?: boolean

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