<template>
  <ion-chip color="dark" class="font-bold text-xs h-7" @click="click" :disabled="loading">
    <ion-spinner v-if="loading || status === undefined" class="w-16" name="dots"/>
    <template v-else>
      <ion-icon :name="icon" class="mr-1 -ml-1 opacity-80 text-base"/>
      <ion-label class="opacity-80">{{ $t((status || 'join').toLowerCase()) }}</ion-label>
      <ion-icon name="chevron-down-sharp" class="ml-0 text-sm"
                v-if="status && !readonly && status !== 'PENDING_MEMBER'"/>
    </template>
  </ion-chip>
</template>
<script lang="ts">
import {Emit, Prop, Vue} from 'vue-property-decorator'
import Component from 'vue-class-component'
import {GroupStatus} from '@/types/GroupStatus'
import PopoverPresenter from '@/tools/PopoverPresenter'
import {askConfirmation} from '@/tools/askConfirmation'

@Component({
  name: 'group-status-button'
})
export default class GroupStatusButton extends Vue {

  @Prop()
  status: GroupStatus

  @Prop(Boolean)
  readonly: boolean

  @Prop(Boolean)
  loading: boolean

  @Prop(Boolean)
  third: boolean

  get icon() {
    switch (this.status) {
      case GroupStatus.ADMIN:
        return 'person-circle-sharp'
      case GroupStatus.MEMBER:
        return 'people-circle-sharp'
      case GroupStatus.FOLLOWING:
        return 'checkmark-circle-sharp'
      case GroupStatus.PENDING_MEMBER:
        return 'time-sharp'
      case null:
        return 'person-add'
    }
  }

  @Emit('click')
  click(event) {
    if (this.readonly) return
    if (this.third) {
      let adminAction
      switch (this.status) {
        case GroupStatus.ADMIN:
          adminAction = {
            label: this.$t('revoke-admin'),
            onClick: this.revoke
          }
          break
        case GroupStatus.MEMBER:
          adminAction = {
            label: this.$t('promote-member'),
            onClick: this.promote
          }
          break
      }
      PopoverPresenter.presentList(this.$ionic, event, [adminAction, {
        label: this.$t('remove-member'),
        onClick: this.remove
      }])
    } else {
      switch (this.status) {
        case GroupStatus.ADMIN:
        case GroupStatus.MEMBER:
          PopoverPresenter.presentList(this.$ionic, event, [{
            label: this.$t('leave-group'),
            onClick: this.leave
          }])
          break
        case GroupStatus.FOLLOWING:
          break
        case GroupStatus.PENDING_MEMBER:
          break
        case null:
          this.join()
      }
    }
  }

  @Emit('join')
  join() {
    return
  }

  leave() {
    askConfirmation(this.$ionic, this.$t('leave-group'), this.$t('confirmation-message', [this.$t('leave-group-message')]), this.$t('yes'), this.$t('cancel'))
        .then(() => this.$emit('leave'))
  }

  remove() {
    askConfirmation(this.$ionic, this.$t('remove-member'), this.$t('confirmation-message', [this.$t('remove-member-message')]), this.$t('yes'), this.$t('cancel'))
        .then(() => this.$emit('remove'))
  }

  promote() {
    askConfirmation(this.$ionic, this.$t('promote-member'), this.$t('confirmation-message', [this.$t('promote-member-message')]), this.$t('yes'), this.$t('cancel'))
        .then(() => this.$emit('promote'))
  }

  revoke() {
    askConfirmation(this.$ionic, this.$t('revoke-admin'), this.$t('confirmation-message', [this.$t('revoke-admin-message')]), this.$t('yes'), this.$t('cancel'))
        .then(() => this.$emit('revoke'))
  }

}
</script>