<template>
  <ion-textarea ref="textarea" :value="model" :placeholder="placeholder"
                maxlength="1024" rows="4" @click="runAutoScroll"
                @ionChange="setValue($event.target.value)"></ion-textarea>
</template>
<script lang="ts">
import {Component, Emit, Prop, VModel, Vue} from 'vue-property-decorator'

@Component({
  name: 'grow-textarea'
})
export default class GrowTextarea extends Vue {

  scroll = 0

  @Prop({required: false})
  placeholder: string

  @Prop()
  content: HTMLIonContentElement

  @VModel()
  model: string

  mounted() {
    this.runAutoGrow()
  }

  setValue(value) {
    this.model = value
    this.runAutoGrow()
  }

  runAutoGrow() {
    (this.$refs['textarea'] as HTMLIonTextareaElement).getInputElement()
        .then(textarea => {
          textarea.style.height = 'auto'
          textarea.style.height = textarea.scrollHeight + 'px';
          (this.$refs['textarea'] as HTMLIonTextareaElement).style.height = textarea.scrollHeight + 'px'
        })
  }

  runAutoScroll() {
    (this.$refs['textarea'] as HTMLIonTextareaElement).getInputElement()
        .then(textarea => {
          const fontSize = Number(window.getComputedStyle(textarea, null).getPropertyValue('font-size').replace('px', ''))
          const currentLine = textarea.value.substring(0, textarea.selectionStart).split('\n').length
          const scroll = fontSize * currentLine - fontSize
          if (scroll !== this.scroll) {
            this.content.scrollToPoint(0, fontSize * currentLine - fontSize, 500)
            this.scroll = scroll
          }
        })
  }

}
</script>