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
          <ion-icon slot="start" :src="require('ionicons5/dist/svg/download-outline.svg')" color="back"
                    class="mr-2 -ml-2 -mt-1"/>
          {{ $t('download-report') }}
          </span>
        </ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <empty-text v-if="!firstDate" :text="$t('no-cleanups-yet')"/>
      <template v-else>

        <ion-list-header>{{ $t('select-report-date') }}</ion-list-header>

        <ion-list lines="full" class="-mt-2">
          <ion-item>
            <ion-radio :checked="selection === 'always'" @ionSelect="selection = 'always'"
                       mode="md" slot="start"></ion-radio>
            <ion-label>
              <span :class="{'opacity-60': selection !== 'always'}">{{ $t('always') }}</span>
            </ion-label>
          </ion-item>

          <ion-item>
            <ion-radio mode="md" :checked="selection === 'month'" @ionSelect="selection = 'month'"
                       slot="start" class="my-auto"></ion-radio>
            <ion-label position="stacked">
              <span :class="{'opacity-60': selection !== 'month'}">{{ $t('specific-month') }}</span>
            </ion-label>
            <ion-datetime class="ml-" :disabled="selection !== 'month'" display-format="MMMM YYYY"
                          :month-names="monthNames" :value="month" @ionChange="month = $event.target.value"
                          :min="firstDate" :max="today"></ion-datetime>
          </ion-item>

          <div class="flex">
            <div class="h-full p-5">
              <ion-radio :checked="selection === 'range'" @ionSelect="selection = 'range'"
                         mode="md" slot="start" class="my-auto"></ion-radio>
            </div>
            <div class="pl-3">
              <ion-label>
                <span class="text-xs" :class="{'opacity-60': selection !== 'range'}">{{ $t('dates-range') }}</span>
              </ion-label>
              <div class="flex w-full items-center">
                <ion-datetime placeholder="From" :disabled="selection !== 'range'" class=" px-0"
                              @ionFocus.prevent="() => null"
                              display-format="DD MMMM YYYY" :value="start" :month-names="monthNames"
                              :min="firstDate" :max="today" @ionChange="start = $event.target.value"></ion-datetime>
                <span class="mx-4">-</span>
                <ion-datetime placeholder="To" :disabled="selection !== 'range'" class=" px-0"
                              display-format="DD MMMM YYYY" :value="end" :month-names="monthNames"
                              :min="firstDate" :max="today" @ionChange="end = $event.target.value"></ion-datetime>
              </div>
            </div>
          </div>
          <hr style="height: 1px">
        </ion-list>

        <div class="w-full justify-center flex mt-4">
          <ion-button shape="round" @click="download">
            {{ $t('download') }}
          </ion-button>
        </div>
      </template>
    </ion-content>
  </ion-page>
</template>
<script lang="ts">
import {monthNames} from '@/tools/Utils'
import {Component, Vue} from 'vue-property-decorator'
import {groupsProvider} from '@/providers/data/groups.provider'
import ToastPresenter from '@/tools/ToastPresenter'
import ErrorMessage from '@/tools/ErrorMessage'
import {appModule} from '@/store/appModule'
import {FileOpener} from '@capacitor-community/file-opener'
import EmptyText from '@/views/components/common/EmptyText.vue'

@Component({
  name: 'GroupReportPage',
  components: {EmptyText}
})
export default class GroupReportPage extends Vue {

  id: number
  selection: 'always' | 'month' | 'range' = 'always'
  month = new Date().toISOString().split('T')[0]
  start = null
  end = new Date().toISOString().split('T')[0]
  firstDate = null
  today = new Date().toISOString().split('T')[0]

  get downloadRange() {
    switch (this.selection) {
      case 'always':
        return {start: this.firstDate, end: this.today}
      case 'month':
        return {
          start: this.month.slice(0, 8) + '01',
          end: this.month.slice(0, 8) + new Date(new Date(this.month).getFullYear(), new Date(this.month).getMonth() + 1, 0).getDate()
        }
      case 'range':
        return {
          start: this.start.split('T')[0],
          end: this.end.split('T')[0]
        }
    }
  }

  get monthNames() {
    return monthNames[this.$i18n.locale]
  }

  async mounted() {
    this.id = +this.$route.params.id
    this.firstDate = new Date((await groupsProvider.fetchFirstCleanup(this.id)).cleanup.date).toISOString().split('T')[0]
        .replace(/^(.*)-..$/, '$1-01')
    this.start = this.firstDate
  }

  download() {
    appModule.showLoader(this.$ionic)
        .then(() => {
          const range = this.downloadRange
          groupsProvider.downloadReport(this.id, range.start, range.end, this.$i18n.locale)
              .then(({path}) => {
                FileOpener.open({filePath: path})
              })
              .catch(error => {
                ToastPresenter.present(this.$ionic, ErrorMessage.getMessage(error))
              })
              .finally(() => {
                appModule.hideLoader()
              })
        })
  }
}
</script>