<template>
  <!-- Renders map inside container -->
  <div>
    <div id="mapContainer" ref="mapContainer">
      <div v-if="scenarios.length >= 2" id="slider" ref="slider" />
    </div>
    <b-card v-if="loading" class="loading-dialog">
      <LoadingSpinner />
      <h2>Generating model</h2>
      <b-btn variant="danger" @click="cancelTask">Cancel</b-btn>
    </b-card>
    <div v-else>
      <Plotly id="depthPlot" v-if="plotData" :data="plotData"/>
    </div>
  </div>
</template>

<script lang="ts">
// @ts-nocheck
//todo
import Vue, {PropType} from "vue";
import * as Cesium from "cesium";
import 'cesium/Source/Widgets/widgets.css'
import {MapViewerDataSourceOptions, Scenario} from "@/types";
import axios from "axios";
import {Plotly} from "vue-plotly";
import LoadingSpinner from "./LoadingSpinner.vue";

console.log("V0.0.5")

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

  components: {
    LoadingSpinner,
    Plotly,
  },

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
      default() { return {} }
    },
    scenarios: {
      type: Array as () => Array<Scenario>,
      default() { return [] }
    },
    scenarioOptions: {
      type: Object,
      default() { return {} }
    },
  },

  data() {
    return {
      /** Cesium viewer and map renderer */
      viewer: null as Cesium.Viewer | null,
      loading: false,
      handler: null as Cesium.ScreenSpaceEventHandler | null,
      plotData: null as any, //todo
      plotRenderEvt: () => {},
      scratch: new Cesium.Cartesian2(),
      boxSelection: {
        selector: new Cesium.Entity(),
        firstPoint: new Cesium.Cartographic(),
        firstPointSet: false,
        mouseDown: false,
        rectangleSelector: new Cesium.Rectangle()
      },
      taskId: null as string | null,
    }
  },

  created() {
    Cesium.Ion.defaultAccessToken = this.cesiumAccessToken;
  },

  mounted() {
    this.viewer = new Cesium.Viewer("mapContainer");
    this.setScreenSpaceEvents();
    // this.initSlider();

    if (!this.viewer.scene.pickPositionSupported) {
      alert("This browser does not support pickPosition.")
    }

    const initPos = Cesium.Cartesian3.fromDegrees(this.initLong, this.initLat, this.initHeight);
    this.viewer.camera.flyTo({destination: initPos});
  },

  watch: {
    dataSources(dataSources) {
      this.removeDataSources()
      this.addDataSourcesProp(dataSources);
    },
    scenarios(scenarios) {
      this.removeDataSources();
      this.addDataSourcesProp(scenarios[0]);
    },
  },

  computed: {
    selectionBbox() {
      const firstPoint = Cesium.Rectangle.northwest(this.boxSelection.rectangleSelector);
      const secondPoint = Cesium.Rectangle.southeast(this.boxSelection.rectangleSelector);
      const bbox = {
        lat1: Cesium.Math.toDegrees(firstPoint.latitude),
        lng1: Cesium.Math.toDegrees(firstPoint.longitude),
        lat2: Cesium.Math.toDegrees(secondPoint.latitude),
        lng2: Cesium.Math.toDegrees(secondPoint.longitude)
      }
      console.log("computed new bbox")
      return bbox;
    }
  },

  methods: {
    setScreenSpaceEvents() {
      if (this.viewer)
        this.viewer.scene.screenSpaceCameraController.enableLook = false

      this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer?.canvas);

      //Draw the selector while the user drags the mouse while holding shift
      const drawSelector = (movement: Cesium.ScreenSpaceEventHandler.MotionEvent) => {
        if (!this.boxSelection.mouseDown) {
          return;
        }

        const cartesian = this.viewer?.camera.pickEllipsoid(movement.endPosition, this.viewer.scene.globe.ellipsoid);
        if (cartesian) {
          //mouse cartographic
          const cartographic = Cesium.Cartographic.fromCartesian(cartesian, Cesium.Ellipsoid.WGS84);

          if (!this.boxSelection.firstPointSet) {
            this.boxSelection.firstPoint = Cesium.Cartographic.clone(cartographic);
            this.boxSelection.firstPointSet = true;
          } else {
            this.boxSelection.rectangleSelector.east = Math.max(cartographic.longitude, this.boxSelection.firstPoint.longitude);
            this.boxSelection.rectangleSelector.west = Math.min(cartographic.longitude, this.boxSelection.firstPoint.longitude);
            this.boxSelection.rectangleSelector.north = Math.max(cartographic.latitude, this.boxSelection.firstPoint.latitude);
            this.boxSelection.rectangleSelector.south = Math.min(cartographic.latitude, this.boxSelection.firstPoint.latitude);
            this.boxSelection.selector.show = true;
          }
        }
      };
      this.handler.setInputAction(drawSelector, Cesium.ScreenSpaceEventType.MOUSE_MOVE, Cesium.KeyboardEventModifier.SHIFT);

      const getSelectorLocation = new Cesium.CallbackProperty((_time, result) => {
          return Cesium.Rectangle.clone(this.boxSelection.rectangleSelector, result);
        }, false);

      const startClickShift = () => {
        this.boxSelection.mouseDown = true;
        if (this.boxSelection.selector.rectangle)
          this.boxSelection.selector.rectangle.coordinates = getSelectorLocation;
      };
      this.handler.setInputAction(startClickShift, Cesium.ScreenSpaceEventType.LEFT_DOWN, Cesium.KeyboardEventModifier.SHIFT);

      const endClickShift = () => {
        this.boxSelection.mouseDown = false;
        this.boxSelection.firstPointSet = false;
        if (this.boxSelection.selector.rectangle)
          this.boxSelection.selector.rectangle.coordinates = getSelectorLocation;
        this.requestFloodData()
      };
      this.handler.setInputAction(endClickShift, Cesium.ScreenSpaceEventType.LEFT_UP, Cesium.KeyboardEventModifier.SHIFT);

      this.boxSelection.selector = this.viewer?.entities.add({
        show: false,
        rectangle: {
          coordinates: getSelectorLocation,
          material: Cesium.Color.BLACK.withAlpha(0.5)
        }
      }) as Cesium.Entity;

      this.handler.setInputAction((event) => {
        if (this.taskId == null) {
          return
        }
        const worldPosCartesian = this.viewer?.camera.pickEllipsoid(event.position);
        if (worldPosCartesian) {
          const cartographic = Cesium.Ellipsoid.WGS84.cartesianToCartographic(worldPosCartesian)
          const lat = Cesium.Math.toDegrees(cartographic.latitude);
          const lng = Cesium.Math.toDegrees(cartographic.longitude);
          this.queryPoint(lat, lng)
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK, Cesium.KeyboardEventModifier.CTRL);
    },

    async requestFloodData() {
      this.loading = true;
      const bbox = this.selectionBbox
      const response = await axios.post("http://localhost:5000/models/generate", {bbox, scenarioOptions: this.scenarioOptions})
      this.taskId = response.data.taskId
      this.$emit('task-posted', {bbox, taskId: this.taskId})
      if (this.taskId)
        this.pollForTaskCompletion(this.taskId)
    },

    pollForTaskCompletion(taskId: string) {
      if (this.loading) {
        axios.get(`http://localhost:5000/tasks/${taskId}`)
        .then((response: { data: { taskStatus: string; }; }) => {
          if(response.data.taskStatus == "SUCCESS") {
            this.loading = false;
            if (this.boxSelection.selector)
              this.boxSelection.selector.show = false;
            const floodModelId = response.data.taskValue
            this.$emit('task-completed', {bbox: this.selectionBbox, taskId, floodModelId})
          } else {
            // Try again after a timeout
            setTimeout(this.pollForTaskCompletion, 3000, taskId)
          }
        });
      }
    },

    async queryPoint(lat, lng) {
      const response = await axios.get(
        `http://localhost:5000/tasks/${this.taskId}/model/depth`, {params: {lat, lng}});
      this.plotData  = [{
        x: response.data.time,
        y: response.data.depth,
        type: "scatter"
      }]
      this.viewer?.scene.preRender.removeEventListener(this.plotRenderEvt)
      this.plotRenderEvt = () => {
        const position = Cesium.Cartesian3.fromDegrees(lng, lat);
        const canvasPosition = this.viewer?.scene.cartesianToCanvasCoordinates(position, this.scratch)
        if (canvasPosition && Cesium.defined(canvasPosition)) {
          // console.log(this.$refs.depthPlot)
          // this.$refs.depthPlot.style.top = `${canvasPosition.y}px`
          // this.$refs.depthPlot.style.left = `${canvasPosition.x}px`
        }
      }
      this.viewer?.scene.preRender.addEventListener(this.plotRenderEvt)

    },

    cancelTask() {
      axios.delete(`http://localhost:5000/tasks/${this.taskId}`)
        .then(() => {
          this.loading = false;
          this.boxSelection.selector.show = false;
          this.taskId = null;
          this.removeDataSources()
        });
    },

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
      console.log("addDataSourcesProp");
      const ionAssetIds: number[] = dataSource?.ionAssetIds ?? []
      const providersFromAssets: Cesium.ImageryProvider[] = ionAssetIds.map((assetId: number) =>
        new Cesium.IonImageryProvider({assetId}));
      // Combine providersFromAssets and imageryProviders, accounting for undefined options
      const combinedProviders = providersFromAssets.concat(dataSource?.imageryProviders ?? [])

      // Add data sources to viewer, accounting for undefined options
      combinedProviders.forEach(provider => {
        const layer = this.viewer?.imageryLayers.addImageryProvider(provider);
        console.log(layer)
        if (splitDirection != null && layer != null)
          layer.splitDirection = splitDirection;
      });
      dataSource?.geoJsonDataSources?.forEach(geoJson => {
        this.viewer?.dataSources.add(geoJson)
      });
    },

    removeDataSources() {
      console.log("removing data sources");
      console.log(this.viewer.dataSources.length)
      this.viewer?.dataSources.removeAll(true);
      // this.viewer?.imageryLayers.removeAll()
    }
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

#depthPlot {
  position: absolute;
}

.loading-dialog {
  position: absolute;
  top: 25%;
  left: 15%;
}
</style>
