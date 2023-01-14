<template>
  <div>
    <empty-text :text="$t('no-member-requests')" v-if="requests && !requests.length"/>
    <div v-else>
      <ion-card v-for="request in requests" :key="request.id" color="white" mode="ios">
        <ion-card-header mode="ios">
          <ion-avatar class="w-12 h-12 float-left mr-4 align-sub">
            <ion-img :src="request.user.picture.publicUrl"/>
          </ion-avatar>
          <ion-card-title class="text-base" mode="ios">
            {{ request.user.username }}<br>
            <div class="opacity-50 flex items-center mt-1">
              <ion-icon name="location-sharp" class="text-sm"/> <span class="font-normal text-xs">{{ countries[request.user.country.toUpperCase()].name }}</span>
            </div>
          </ion-card-title>
        </ion-card-header>
        <div class="flex no-wrap -mb-4 px-4 mt-2">
          <count-chip small v-if="request.user.totalCleanups" :count="request.user.totalCleanups" type="cleanups"/>
          <count-chip small v-if="request.user.totalWeight !== '0.00'" :count="request.user.totalWeight" type="kilos"/>
          <count-chip small v-if="request.user.totalVolume" :count="request.user.totalVolume" type="liters"/>
        </div>
        <ion-card-content mode="ios">

          <div v-if="request.answers.length" class="mt-3 text-xs">
            <div v-for="(answer, i) in request.answers" :key="i">
              <span class="font-bold">{{ answer.question.question }}</span><br/>
              <span>{{ answer.answer }}</span>
            </div>
          </div>

          <div class="flex justify-end space-x-2 mt-2">
            <ion-button color="danger" size="small" @click="remove(request.id)">
              {{ $t('remove') }}
            </ion-button>
            <ion-button size="small" @click="approve(request.id)">
              {{ $t('approve') }}
            </ion-button>
          </div>
        </ion-card-content>
      </ion-card>
    </div>
  </div>
</template>
<script lang="ts">
import {Component, Emit, Prop, Vue} from 'vue-property-decorator'
import {GroupMemberRequest} from '@/types/GroupMemberRequest'
import {groupsProvider} from '@/providers/data/groups.provider'
import EmptyText from '@/views/components/common/EmptyText.vue'
import CountChip from '@/views/components/common/CountChip.vue'
import {countries} from 'countries-list'

@Component({
  name: 'GroupMemberRequests',
  components: {EmptyText, CountChip}
})
export default class GroupMemberRequests extends Vue {

  @Prop()
  groupId: number

  @Prop()
  requests: GroupMemberRequest[] = null

  get countries() {
    return countries
  }

  @Emit('reload')
  reload() {
    return
  }

  approve(id) {
    groupsProvider.approveMemberRequest(this.groupId, id)
        .then(() => this.reload())
  }

  remove(id) {
    groupsProvider.removeMemberRequest(this.groupId, id)
        .then(() => this.reload())
  }


}
</script>