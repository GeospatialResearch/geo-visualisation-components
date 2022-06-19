<template>
  <div>
    <div id="mapContainer" class="fullSize" />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import * as Cesium from "cesium";

// Add CESIUM_BASE_URL to type declaration of Window, to allow modification of the global window variable
declare global {
  interface Window {
    CESIUM_BASE_URL: string | null
  }
}
// The public served directory for Cesium to find assets in, copied in during the build process
window.CESIUM_BASE_URL = "./build";

export default Vue.extend({
  name: "MapViewer",

  props: {
    /** Initial latitude for map view */
    initLat: {
      type: Number,
      required: true,
      validator: (value: number) => -90 <= value && value <= 90,
    },
    /** Initial longitude for map view */
    initLong: {
      type: Number,
      required: true,
      validator: (value: number) => -180 <= value && value <= 180,
    },
    /** Cesium.Ion.defaultAccessToken value. See: https://cesium.com/learn/ion/cesium-ion-access-tokens/ */
    cesiumAccessToken: {
      type: String,
      required: true
    }
  },

  data() {
    return {
      /** Cesium viewer and map renderer */
      viewer: null as Cesium.Viewer | null,
    }
  },

  created() {
    Cesium.Ion.defaultAccessToken = this.cesiumAccessToken;
  },

  mounted() {
    this.viewer = new Cesium.Viewer("mapContainer");

    const initPos = Cesium.Cartesian3.fromDegrees(this.initLong, this.initLat);
    this.viewer.camera.flyTo({destination: initPos});
  }

});
</script>

<style scoped>
@import url(/Widgets/widgets.css);
</style>
