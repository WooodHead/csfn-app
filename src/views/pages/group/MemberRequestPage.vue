<template>
  <ion-page class="ion-page">
    <ion-header mode="ios">
      <ion-toolbar mode="ios">
        <ion-buttons slot="start">
          <ion-button fill="clear" shape="round" @click="$router.back()">
            <ion-icon name="arrow-back" color="dark"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>{{ $t('join-group') }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="p-4">
        <span class="font-bold text-2xl">{{ group.name }}</span>
        <p class="text-sm opacity-75">{{ $t('fill-request-questions') }}</p>
      </div>
      <ion-list lines="none" class="space-y-4 px-4 mt-2">

        <div v-for="(question, i) in questions" :key="question.id" :class="{'invalid-input': hasError(i)}">
          <ion-item color="light" class="rounded-md">
            <ion-label position="stacked">{{ question.question }}</ion-label>
            <ion-textarea @ionChange="answers[i].answer = $event.target.value"/>
            <ion-note color="danger" v-if="hasError(i)" class="pb-1">
              {{ $t('errors.required-error-f', {param: $t('answer')}) }}
            </ion-note>

          </ion-item>
        </div>

      </ion-list>
    </ion-content>
    <ion-footer>
      <ion-toolbar>
        <ion-button class="sm:w-2/3 lg:w-1/2 m-auto" shape="round" size="block" @click="send" :disabled="loading">
          {{ $t('join') }}
        </ion-button>
      </ion-toolbar>
    </ion-footer>
  </ion-page>
</template>
<script lang="ts">
import {Component, Vue} from 'vue-property-decorator'
import {GroupQuestion} from '@/types/GroupQuestions'
import {groupsProvider} from '@/providers/data/groups.provider'
import {GroupMemberRequestAnswer} from '@/types/GroupMemberRequest'
import {groupsModule} from '@/store/groupsModule'

@Component({
  name: 'GroupJoinPage'
})
export default class MemberRequestPage extends Vue {

  id: number = null
  loading: boolean = false
  questions: GroupQuestion[] = null
  answers: GroupMemberRequestAnswer[] = []
  showErrors = false

  get group() {
    return groupsModule.getCurrentGroup
  }

  hasError(i) {
    return this.showErrors && !this.answers[i].answer
  }

  mounted() {
    this.id = +this.$route.params.id
    groupsModule.fetchGroup(this.id)
    groupsProvider.findGroupQuestions(this.id)
        .then((questions) => {
          this.questions = questions
          this.answers = this.questions.map((question) => ({question: {id: question.id}, answer: ''}))
        })
  }

  send() {
    if (this.answers.some(({answer}) => !answer)) {
      this.showErrors = true
    } else {
      groupsProvider.sendMemberRequest(this.id, {answers: this.answers})
          .then(() => this.$router.back())
    }
  }

}
</script>