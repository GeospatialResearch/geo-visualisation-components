<template>
  <div id="app">
    <MapViewer
        :init-lat="-43.523392915353384"
        :init-long="172.58414599255107"
        :token="hereApiToken"
        class="full-screen-map"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import MapViewer from "@/lib-components/MapViewer.vue";

export default Vue.extend({
  name: 'ServeDev',
  components: {
    MapViewer,
  },
  data() {
    return {
      hereApiToken: process.env.VUE_APP_HEREAPI,
    }
  }
});
</script>
