<template>
  <div :class="{'invalid-input': errors && errors.length, 'disabled': disabled}" class="text-item cursor-pointer">
    <div :class="rounded ? 'rounded-full' : ''" class="overflow-hidden ion-activatable ripple-parent"
         @click="clicked">
      <ion-item :color="outline ? 'light': '' " :lines="noLines ? 'none' : 'full'" :class="itemClass">
        <ion-icon v-if="icon || iconSrc" slot="start" :name="icon" :src="iconSrc" color="dark"></ion-icon>
        <ion-avatar slot="start" v-if="avatarSrc" class="w-6 h-6 my-auto">
          <img :src="avatarSrc"/>
        </ion-avatar>
        <ion-label v-if="label" position="floating">{{ label }}</ion-label>
        <slot>
          <ion-input ref="input" :autocomplete="type === 'password' ? 'new-password' : 'off'"
                     :class="inputClass" :placeholder="placeholder"
                     :readonly="readonly" :type="type === 'password' && showPassword ? 'text' : type"
                     :value="value" :disabled="disabled"
                     @ionBlur="onBlur" @ionChange="change"
                     @ionFocus="focused" @ionInput="onInput"></ion-input>
        </slot>
        <div v-if="$scopedSlots['end']" slot="end">
          <slot name="end"/>
        </div>
        <ion-button v-if="type === 'password' && !$scopedSlots['end']" slot="end"
                    :class="{'mt-6 pt-1 mr-0': !rounded, '-mr-1': rounded}"
                    color="medium"
                    fill="clear" shape="round" @click="showPassword = !showPassword">
          <ion-icon v-if="!showPassword" slot="icon-only" class="mr-0" name="eye"/>
          <ion-icon v-else slot="icon-only" class="mr-0" name="eye-off"/>
        </ion-button>
        <ion-button slot="end" fill="clear" color="medium" class="m-auto" shape="round" @click.stop="showHelp" v-if="help">
          <ion-icon slot="icon-only" :src="require('ionicons5/dist/svg/help-circle-outline.svg')"/>
        </ion-button>
        <ion-note v-if="endNote" slot="end" class="ml-0 mb-0 pb-0 pt-6 text-base">{{ endNote }}</ion-note>
        <ion-button slot="end" fill="clear" color="dark" shape="round" v-if="clear" @click="cleared">
          <ion-icon name="close" size="large" class="-mr-2" slot="icon-only"/>
        </ion-button>
      </ion-item>
      <ion-ripple-effect></ion-ripple-effect>
    </div>
    <div v-for="error in errors" :key="error" :class="!rounded ? 'mb-2' : ''">
      <input-error :error="error"></input-error>
    </div>
    <ion-note v-for="message in messages" :key="message" class="message flex ml-5 mt-2 opacity-75 mb-1">
      <ion-icon name="information-circle" class="mr-1"></ion-icon>
      <span class=" font-bold text-xs">{{ $t(message) }}</span>
    </ion-note>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import {Emit, Prop, Ref} from 'vue-property-decorator'
import InputError from '@/views/components/common/InputError.vue'

@Component({
  name: 'input-item',
  components: {InputError}
})
export default class InputItem extends Vue {

  @Prop(String)
  public readonly value!: string

  @Prop(String)
  public readonly icon!: string

  @Prop(String)
  public readonly iconSrc: string

  @Prop(String)
  public readonly avatarSrc: string

  @Prop(String)
  public readonly type!: string

  @Prop(String)
  public readonly placeholder!: string

  @Prop(String)
  public readonly label?: string

  @Prop(String)
  public readonly inputClass!: string

  @Prop(String)
  public readonly endNote!: string

  @Prop(Boolean)
  public readonly outline!: boolean

  @Prop(Boolean)
  public readonly clear!: boolean

  @Prop(Boolean)
  public readonly rounded!: boolean

  @Prop(Boolean)
  public readonly noLines!: boolean

  @Prop(Array)
  public readonly errors!: string[]

  @Prop(Array)
  public readonly messages?: string[]

  @Prop(HTMLElement)
  public readonly slottedInput!: any

  @Prop(Boolean)
  public readonly readonly: boolean

  @Prop(Boolean)
  public readonly disabled: boolean

  @Prop()
  public readonly itemClass: string

  @Prop(String)
  help: string

  @Ref('input')
  public input!: any

  showPassword = false

  @Emit('input')
  onInput(event) {
    return event.target.value
  }

  change(event) {
    if (event.target.value === '') {
      this.cleared()
    }
  }

  @Emit('cleared')
  cleared() {
    return
  }

  clicked() {
    this.input?.setFocus()
    this.slottedInput?.setFocus ? this.slottedInput?.setFocus() : this.slottedInput?.focus()
    this.focused()
  }

  @Emit('focus')
  focused() {
    return
  }

  @Emit('blur')
  onBlur() {
    return
  }

  focus() {
    this.input?.setFocus()
  }

  blur() {
    this.input?.getInputElement().then((input: HTMLInputElement) => input.blur())
  }

  async showHelp() {
    console.log(this.label)
    const alert = await this.$ionic.alertController.create({
      message: this.help,
      buttons: [{text: this.$t('accept').toString(), role: 'cancel'}]
    })
    await alert.present()
  }

}
</script>
<style>
.text-item {
  width: 100%;
}

.text-item ::slotted(ion-icon[slot="start"]) {
  margin-inline-end: 16px;
}

.text-item ion-item {
  --inner-border-width: 0;
}

.text-item .rounded-full ion-item {
  --border-radius: 999px;
}

.text-item.disabled {
  padding-bottom: 0.5rem;
}

.text-item.disabled, .text-item.disabled ion-item {
  background: #f4f4f4 !important;
  --background: #f4f4f4 !important;
}

.text-item.disabled .message {
  opacity: 0.5;
}

.text-item.disabled ion-label, .text-item.disabled input {
  opacity: 0.75 !important;
}
</style>
