<template>
  <div class="text-center py-5 font-bold opacity-50">
    {{ text }}
  </div>
</template>
<script lang="ts">

import {Component, Prop, Vue} from 'vue-property-decorator'

@Component({
  name: 'EmptyText'
})
export default class EmptyText extends Vue {

  @Prop(String)
  text: string

}

</script>
