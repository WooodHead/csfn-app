<template>
  <div class="flex flex-col items-center justify-center w-32 h-32 relative">
    <transition name="fade">
      <div v-if="focused" class="tooltip text-sm absolute z-10 -mt-32">
        <span>{{ Number(value) | localeString }} {{ label }}</span>
      </div>
    </transition>
    <div ref="progress" class="w-24 h-24 absolute rounded-full ion-activatable ripple-parent"
         tabindex="1" @focus="focused = true" @blur="focused = false">
      <ion-ripple-effect/>
    </div>
    <slot name="icon">
      <ion-icon :src="iconSrc" class="text-base -mt-1"/>
    </slot>
    <div class="text-2xl">
      <span>{{ integer }}</span>
      <span class="text-xs" v-if="decimal">{{ decimal }}</span>
    </div>
    <span class="text-xs economica -mt-1">{{ label }}</span>
  </div>
</template>
<script lang=ts>
import Vue from 'vue'
import Component from 'vue-class-component'
import ProgressBar from 'progressbar.js'
import Shape from 'progressbar.js/shape'
import {Prop, Watch} from 'vue-property-decorator'
import language from '@/tools/language'
import millify from 'millify'
import {localeString} from '@/tools/Utils'

@Component({
  name: 'stats-counter'
})
export default class StatsCounter extends Vue {

  @Prop(String)
  iconSrc: string

  @Prop(String)
  label: string

  @Prop({default: '0'})
  value: number | string

  @Prop({type: String})
  progressValue: number

  @Prop(Number)
  max: number

  @Prop(Boolean)
  noAnimate: boolean

  @Prop({type: Array, default: () => ['#9ed362', '#148f31']})
  colors: string[]

  focused = false

  get localizedSeparator() {
    return (1.1).toLocaleString(language())[1]
  }

  get integer() {
    const integer = Number(this.value.toString().split('.')[0])
    return integer < 1000 ? integer : millify(integer, {decimalSeparator: this.localizedSeparator})
  }

  get decimal() {
    return this.value.toString().includes('.') && this.value.toString().split('.')[1] !== '00' && !isNaN(+this.integer)
        ? this.localizedSeparator + this.value.toString().split('.')[1] : ''
  }

  progressBar: Shape = null

  mounted() {
    try {
      this.progressBar = new ProgressBar.Circle(this.$refs['progress'] as HTMLElement, {
        strokeWidth: 4,
        easing: 'easeInOut',
        duration: 1000,
        trailColor: '#EEEEEE',
        from: {color: this.colors[0].toUpperCase()},
        to: {color: this.colors[1].toUpperCase()},
        step: function (state,
                        circle,
                        attachment) {
          circle.path.setAttribute('stroke', state.color)
        },
      })
      if (!this.noAnimate) {
        this.progressBar.animate(Math.min(Number(this.progressValue) / this.max, 1))
      } else {
        this.progressBar.set(Math.min(Number(this.progressValue) / this.max, 1))
      }
    } catch (e) {
    }
  }

  @Watch('progressValue')
  valueChanged(progressValue) {
    this.progressBar.animate(Math.min(progressValue / this.max, 1))
  }

}
</script>
<style scoped>

</style>
