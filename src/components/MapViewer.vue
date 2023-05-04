<template>
  <!-- Renders map inside container -->
  <div>
    <div id="mapContainer" ref="mapContainer" class="fullSize">
      <div id="slider" ref="slider" />
    </div>
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
      type: Object as PropType<MapViewerDataSourceOptions>,
      default() {
        return {}
      }
    },
    scenarios: {
      type: Array as () => Array<Scenario>,
      default() {
        return []
      }
    },
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
    this.initSlider();

    const initPos = Cesium.Cartesian3.fromDegrees(this.initLong, this.initLat, this.initHeight);
    this.viewer.camera.flyTo({destination: initPos});
  },

  watch: {
    dataSources(dataSources) {
      this.addDataSourcesProp(dataSources);
    },
    scenarios(scenarios) {
      this.addDataSourcesProp(scenarios[0], Cesium.SplitDirection.LEFT);
      this.addDataSourcesProp(scenarios[1], Cesium.SplitDirection.RIGHT);
    }
  },

  methods: {
    initSlider() {
      const slider = this.$refs.slider as HTMLDivElement;
      const mapContainer = this.$refs.mapContainer as HTMLDivElement;
      if (this.viewer != null) {
        this.viewer.scene.splitPosition = (slider.offsetLeft ?? 0) / (mapContainer.offsetWidth ?? 1);
      }

      const handler = new Cesium.ScreenSpaceEventHandler(slider as unknown as HTMLCanvasElement);
      let moveActive = false;

      const move = (movement: Cesium.ScreenSpaceEventHandler.MotionEvent) => {
        if (!moveActive) {
          return;
        }

        const relativeOffset = movement.endPosition.x;
        const splitPosition = ((slider.offsetLeft ?? 0) + relativeOffset) / (mapContainer.offsetWidth ?? 1);
        slider.style.left = `${100.0 * splitPosition}%`;
        if (this.viewer != null)
          this.viewer.scene.splitPosition = splitPosition;
      }

      handler.setInputAction(() => {
        moveActive = true;
      }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
      handler.setInputAction(function () {
        moveActive = true;
      }, Cesium.ScreenSpaceEventType.PINCH_START);

      handler.setInputAction(move, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      handler.setInputAction(move, Cesium.ScreenSpaceEventType.PINCH_MOVE);

      handler.setInputAction(function () {
        moveActive = false;
      }, Cesium.ScreenSpaceEventType.LEFT_UP);
      handler.setInputAction(function () {
        moveActive = false;
      }, Cesium.ScreenSpaceEventType.PINCH_END);
    },

    addDataSourcesProp(dataSource: MapViewerDataSourceOptions, splitDirection?: Cesium.SplitDirection) {
      const ionAssetIds: number[] = dataSource?.ionAssetIds ?? []
      const providersFromAssets: Cesium.ImageryProvider[] = ionAssetIds.map((assetId: number) =>
          new Cesium.IonImageryProvider({assetId}));
      // Combine providersFromAssets and imageryProviders, accounting for undefined options
      const combinedProviders = providersFromAssets.concat(dataSource?.imageryProviders ?? [])

      // Add data sources to viewer, accounting for undefined options
      combinedProviders.forEach(provider => {
        const layer = this.viewer?.imageryLayers.addImageryProvider(provider);
        if (splitDirection != null && layer != null)
          layer.splitDirection = splitDirection;
      });
      dataSource?.geoJsonDataSources?.forEach(geoJson => {
        this.viewer?.dataSources.add(geoJson);
      });
    },
  }

});
</script>

<style scoped>
#slider {
  position: absolute;
  left: 50%;
  top: 0;
  background-color: #d3d3d3;
  width: 5px;
  height: 100%;
  z-index: 9999;
}

#slider:hover {
  cursor: ew-resize;
}
</style>
