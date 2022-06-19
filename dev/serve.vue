<template>
  <!--  Example app for library development-->
  <div id="app">
    <MapViewer
        :init-lat="-43.523392915353384"
        :init-long="172.58414599255107"
        :cesium-access-token="cesiumAccessToken"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import MapViewer from "@/components/MapViewer.vue";

export default Vue.extend({
  name: 'ServeDev',
  components: {
    MapViewer,
  },
  data() {
    return {
      cesiumAccessToken: process.env.VUE_APP_CESIUM_ACCESS_TOKEN,
    }
  }
});
</script>
