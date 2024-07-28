<template>
  <!--  Example app for library development-->
  <div id="app">
    <MapViewer
        :cesium-access-token="cesiumAccessToken"
        :init-lat="-43.523392915353384"
        :init-long="172.58414599255107"
        :init-base-layer="baseLayer"
    />
  </div>
</template>

<script lang="ts">
import * as Cesium from 'cesium';
import MapViewer from "@/components/MapViewer.vue";
import {defineComponent} from "vue";

export default defineComponent({
  name: 'ServeDev',
  components: {
    MapViewer,
  },
  data() {
    return {
      cesiumAccessToken: import.meta.env.VITE_CESIUM_ACCESS_TOKEN,
      baseLayer: new Cesium.ImageryLayer(new Cesium.OpenStreetMapImageryProvider({}), {})
    }
  }
});
</script>
