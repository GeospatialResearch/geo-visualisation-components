<script lang="ts">
import Vue from 'vue';
import MapViewer from "@/lib-components/MapViewer.vue";
// Uncomment import and local "components" registration if library is not registered globally.
// import { GeoVisualisationComponentsSample } from '@/entry.esm';

export default Vue.extend({
  name: 'ServeDev',
  components: {
    MapViewer,
  }
});
</script>

<template>
  <div id="app">
    <MapViewer />
  </div>
</template>
