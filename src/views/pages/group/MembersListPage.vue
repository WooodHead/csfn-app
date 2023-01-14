<template>
  <ion-page class="ion-page">
    <ion-header mode="ios">
      <ion-toolbar mode="ios">
        <ion-buttons slot="start">
          <ion-button fill="clear" shape="round" @click="$router.back()">
            <ion-icon name="arrow-back" color="dark"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>{{ $t('group-members') }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-list lines="full" class="p-0" v-if="members">
        <ion-item v-for="(member, i) in members" :key="i">
          <ion-avatar slot="start">
            <img :src="member.user.picture.publicUrl"/>
          </ion-avatar>
          <ion-label class="font-bold my-4">
            {{ member.user.username }}
          </ion-label>
          <div slot="end" class="inline">
            <group-status-button :status="member.isAdmin ? 'ADMIN' : 'MEMBER'" third
                                 :readonly="!currentUserIsAdmin || member.user.id === currentUserId"
                                 @promote="promoteMember(member.user.id, i)"
                                 @revoke="revokeAdmin(member.user.id, i)"
                                 @remove="removeMember(member.user.id, i)"/>
          </div>
        </ion-item>
        <ion-infinite-scroll @ionInfinite="nextMembers" :disabled="!hasMore" :key="'i' + hasMore">
          <ion-infinite-scroll-content/>
        </ion-infinite-scroll>
      </ion-list>
    </ion-content>
  </ion-page>
</template>
<script lang="ts">
import {Component, Vue} from 'vue-property-decorator'
import User from '@/types/User'
import {groupsProvider} from '@/providers/data/groups.provider'
import {GroupStatus} from '@/types/GroupStatus'
import {userModule} from '@/store/userModule'
import GroupStatusButton from '@/views/components/groups/GroupStatusButton.vue'
import CountChip from '@/views/components/common/CountChip.vue'

@Component({
  name: 'MembersListPage',
  components: {CountChip, GroupStatusButton}
})
export default class MembersListPage extends Vue {

  id: number = null
  status: GroupStatus = null
  page = 1
  members: { user: User, isAdmin: boolean }[] = null
  hasMore = true

  get currentUserId() {
    return userModule.getCurrentUser.id
  }

  get currentUserIsAdmin() {
    return this.status === GroupStatus.ADMIN
  }

  mounted() {
    this.id = +this.$route.params.id
    this.fetchMembers()
    this.fetchStatus()
  }

  fetchMembers() {
    return groupsProvider.fetchGroupMembers(this.id, this.page, 10)
        .then(({data, meta}) => {
          if (!this.members) {
            this.members = data
          } else {
            this.members.push(...data)
          }
          if (meta?.totalItems === this.members.length) {
            this.hasMore = false
          }
        })
  }

  fetchStatus() {
    userModule.fetchGroupStatus(this.id)
        .then(({status}) => this.status = status)
  }

  nextMembers(event) {
    this.page++
    this.fetchMembers()
        .finally(() => event.target.complete())
  }

  promoteMember(id: number, index: number) {
    groupsProvider.updateGroupMember(this.id, id, {isAdmin: true})
        .then(() => Vue.set(this.members, index, {...this.members[index], isAdmin: true}))
  }

  revokeAdmin(id: number, index: number) {
    groupsProvider.updateGroupMember(this.id, id, {isAdmin: false})
        .then(() => Vue.set(this.members, index, {...this.members[index], isAdmin: false}))
  }

  removeMember(id: number, index: number) {
    groupsProvider.removeGroupMember(this.id, id)
        .then(() => this.members.splice(index, 1))
  }
}
</script>