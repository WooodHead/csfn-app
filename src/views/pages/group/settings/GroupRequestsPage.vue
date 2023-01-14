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
          <ion-icon slot="start" :src="require('ionicons5/dist/svg/person-add-outline.svg')" color="back"
                    class="mr-2 -ml-2"/>
          {{ $t('group-requests') }}
          </span>
        </ion-title>
      </ion-toolbar>
      <ion-toolbar mode="md">
        <ion-segment mode="md" :value="segment" @ionChange="segment = $event.target.value">
          <ion-segment-button mode="md" value="members">
            <ion-badge color="danger" class="absolute right-0 mr-3" v-if="memberRequests.length">
              {{ memberRequests.length }}
            </ion-badge>
            {{ $t('members') }}
          </ion-segment-button>
          <ion-segment-button mode="md" value="tags">
            <ion-badge color="danger" class="absolute right-0 mr-3" v-if="tagRequests.length">
              {{ tagRequests.length }}
            </ion-badge>
            {{ $t('tags') }}
          </ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-header>
    <ion-content color="lighter">

      <transition name="fade" v-if="id" mode="out-in">
        <group-member-requests :group-id="id" v-if="segment==='members'" :requests="memberRequests"
                               @reload="fetchMembers"/>
        <group-tag-requests :group-id="id" v-else :requests="tagRequests" @reload="fetchTags"/>
      </transition>

    </ion-content>
  </ion-page>
</template>
<script lang="ts">
import {Component, Vue} from 'vue-property-decorator'
import GroupMemberRequests from '@/views/components/groups/GroupMemberRequests.vue'
import GroupTagRequests from '@/views/components/groups/GroupTagRequests.vue'
import {groupsProvider} from '@/providers/data/groups.provider'
import {GroupMemberRequest} from '@/types/GroupMemberRequest'
import {GroupTagRequest} from '@/types/GroupTagRequest'


@Component({
  name: 'GroupRequestsPage',
  components: {GroupTagRequests, GroupMemberRequests}
})
export default class GroupRequestsPage extends Vue {

  id: number = null
  segment = 'members'
  memberRequests: GroupMemberRequest[] = null
  tagRequests: GroupTagRequest[] = null

  mounted() {
    this.id = +this.$route.params.id
    this.fetchMembers()
    this.fetchTags()
  }

  fetchMembers() {
    groupsProvider.findMemberRequests(this.id)
        .then(requests => this.memberRequests = requests)

  }

  fetchTags() {
    groupsProvider.findTagRequests(this.id)
        .then(requests => this.tagRequests = requests)
  }

}
</script>