<template>
  <div>
    <empty-text :text="$t('no-tag-requests')" v-if="!requests || !requests.length"/>

    <div v-else>
      <ion-card v-for="request in requests" :key="request.id" color="white" mode="ios">
        <ion-card-header class="flex items-center -mb-3">
          <ion-avatar class="w-8 h-8">
            <img :src="request.user.picture.publicUrl"/>
          </ion-avatar>
          <div class="opacity-60 ml-2"><span class="font-bold">{{ request.user.username }}</span>
            {{ $t('wants-to-be-tagged') }}
          </div>
        </ion-card-header>
        <ion-item lines="none" button style="--padding-left: 0" @click="$router.push('/cleanup/' + request.cleanup.id)">
          <div class="space-y-2">
              <span class="font-bold text-base">
                {{ $t('cleanup-in') }}
                {{ request.cleanup.location.address.city }}
              </span>
            <div class="text-sm opacity-75">{{ formatDate(request.cleanup.date) }}</div>
            <div>
              <count-chip :count="request.cleanup.volume" type="liters"/>
              <count-chip :count="request.cleanup.weight" type="kilos"/>
            </div>
          </div>
          <ion-thumbnail class="w-24 h-24" slot="end">
            <img :src="request.cleanup.pictures[0].publicUrl"/>
          </ion-thumbnail>
        </ion-item>
        <div class="flex justify-end space-x-2 p-4">
          <ion-button color="danger" size="small" @click="remove(request.id)">
            {{ $t('remove') }}
          </ion-button>
          <ion-button size="small" @click="approve(request.id)">
            {{ $t('approve') }}
          </ion-button>
        </div>
      </ion-card>
    </div>
  </div>
</template>
<script lang="ts">
import {Component, Emit, Prop, Vue} from 'vue-property-decorator'
import EmptyText from '@/views/components/common/EmptyText.vue'
import {GroupTagRequest} from '@/types/GroupTagRequest'
import {groupsProvider} from '@/providers/data/groups.provider'
import CountChip from '@/views/components/common/CountChip.vue'
import moment from 'moment/moment'

@Component({
  name: 'GroupTagRequests',
  components: {EmptyText, CountChip}
})
export default class GroupTagRequests extends Vue {

  @Prop()
  groupId: number

  @Prop()
  requests: GroupTagRequest[]

  @Emit('reload')
  reload() {
    return
  }

  approve(id) {
    groupsProvider.approveTagRequest(this.groupId, id)
        .then(() => this.reload())
  }

  remove(id) {
    groupsProvider.removeTagRequest(this.groupId, id)
        .then(() => this.reload())
  }

  formatDate(date) {
    return moment(date).format('D MMMM YYYY')
  }


}
</script>