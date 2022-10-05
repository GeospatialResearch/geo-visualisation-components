<template>
  <!-- Renders map inside container -->
  <div>
    <div id="mapContainer" class="fullSize" />
  </div>
</template>

<script lang="ts">
import Vue, {PropType} from "vue";
import * as Cesium from "cesium";
import 'cesium/Source/Widgets/widgets.css'
import {MapViewerDataSourceOptions, Scenario} from "@/types";

// Add CESIUM_BASE_URL to type declaration of Window, to allow modification of the global window variable
declare global {
  interface Window {
    CESIUM_BASE_URL: string | null
  }
}
// The public served directory for Cesium to find assets in, copied in during the build process
window.CESIUM_BASE_URL = "./";


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
    },
    /** Initial height of the camera in metres. Default is 2000m */
    initHeight: {
      type: Number,
      default: 2000,
    },
    dataSources: {
      type: Object as PropType<MapViewerDataSourceOptions>
    },
    scenarios: {
      type: Array as () => Array<Scenario>
    },
    pickedScenarioName: String,
  },

  data() {
    return {
      /** Cesium viewer and map renderer */
      viewer: null as Cesium.Viewer | null,
    }
  },

  created() {
    Cesium.Ion.defaultAccessToken = this.cesiumAccessToken;
    // this.addDataSourcesProp();
  },

  mounted() {
    this.viewer = new Cesium.Viewer("mapContainer");

    const initPos = Cesium.Cartesian3.fromDegrees(this.initLong, this.initLat, this.initHeight);
    this.viewer.camera.flyTo({destination: initPos});
  },

  watch: {
    dataSources(dataSources) {
      this.addDataSourcesProp(dataSources);
    },
    pickedScenario(newScenario, oldScenario) {
      this.removeDataSources(oldScenario);
      this.addDataSourcesProp(newScenario)
    }
  },

  computed: {
    pickedScenario(): Scenario {
      return this.scenarios.find(scenario => scenario.name === this.pickedScenarioName) ?? this.scenarios[0];
    }
  },

  methods: {
    addDataSourcesProp(dataSource: MapViewerDataSourceOptions) {
      const ionAssetIds: number[] = dataSource?.ionAssetIds ?? []
      const providersFromAssets: Cesium.IonImageryProvider[] = ionAssetIds.map((assetId: number) =>
          new Cesium.IonImageryProvider({assetId}));
      // Combine providersFromAssets and ionImageryProviders, accounting for undefined options
      const combinedProviders = providersFromAssets.concat(dataSource?.ionImageryProviders ?? [])

      // Add data sources to viewer, accounting for undefined options
      combinedProviders.forEach(provider => {
        this.viewer?.imageryLayers.addImageryProvider(provider);
      });
      dataSource?.geoJsonDataSources?.forEach(geoJson => {
        this.viewer?.dataSources.add(geoJson);
      });
    },

    removeDataSources(dataSource: MapViewerDataSourceOptions) {
      console.log('Remove ds');
      console.log(dataSource)
    }
  }

});
</script>

<style scoped>
</style>
