<template>
  <search-group @click="$router.push('/group/' + $event)" exclude-current-user/>
</template>
<script lang="ts">
import {Vue} from 'vue-property-decorator'
import Component from 'vue-class-component'
import SearchGroup from '@/views/components/groups/SearchGroup.vue'

@Component({
  name: 'search-group-page',
  components: {SearchGroup}
})
export default class SearchGroupPage extends Vue {

}
</script>