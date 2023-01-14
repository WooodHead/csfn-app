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
          <ion-icon slot="start" :src="require('ionicons5/dist/svg/help-circle-outline.svg')" color="back"
                    class="mr-2"/>
          {{ $t('group-questions') }}
          </span>
        </ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>

      <empty-text :text="$t('no-questions')" v-if="questions && !questions.length" class="mx-6"/>

      <ion-list class="space-y-2 mt-2">
        <ion-item v-for="(question, i) in questions" :key="question.id" mode="md" lines="none" color="lighter"
                  class="mx-2 rounded-lg">
          <ion-textarea :value="question.question" :placeholder="$t('write-question')"
                        @ionChange="question.question = $event.target.value"/>
          <ion-button slot="end" shape="round" color="danger" fill="clear" @click="remove(i)">
            <ion-icon name="close" slot="icon-only" size="large" class="mr-0"/>
          </ion-button>
        </ion-item>

        <ion-button fill="clear" class="ml-2" @click="add()">
          <ion-icon :src="require('ionicons5/dist/svg/add-circle-outline.svg')" slot="start"/>
          <ion-label>{{ $t('add-question') }}</ion-label>
        </ion-button>
      </ion-list>

    </ion-content>
    <ion-footer>
      <ion-toolbar>
        <ion-button class="sm:w-2/3 lg:w-1/2 m-auto" shape="round" size="block" @click="save" :disabled="loading">
          {{ $t('save') }}
        </ion-button>
      </ion-toolbar>
    </ion-footer>
  </ion-page>
</template>
<script lang="ts">
import {Component, Vue} from 'vue-property-decorator'
import {groupsProvider} from '@/providers/data/groups.provider'
import {GroupQuestion} from '@/types/GroupQuestions'
import ToastPresenter from '@/tools/ToastPresenter'
import EmptyText from '@/views/components/common/EmptyText.vue'

@Component({
  name: 'GroupQuestionsPage',
  components: {EmptyText}
})
export default class GroupQuestionsPage extends Vue {

  id = null
  questions: GroupQuestion[] = []
  loading = false

  mounted() {
    this.id = +this.$route.params.id
    groupsProvider.findGroupQuestions(this.id)
        .then((questions) => this.questions = questions)
  }

  add() {
    this.questions.push({id: Math.random(), question: ''})
  }

  remove(i) {
    this.questions.splice(i, 1)
  }

  save() {
    this.loading = true
    groupsProvider.setGroupQuestions(this.id, {questions: this.questions.map(({question}) => ({question}))})
        .then(() => ToastPresenter.present(this.$ionic, this.$t('questions-saved'), 'success'))
        .finally(() => this.loading = false)
  }

}
</script>