<template>
  <div>
    <canvas ref="map" />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import {MapView} from "@here/harp-mapview";
import {GeoCoordinates} from "@here/harp-geoutils";
import {Theme} from "@here/harp-datasource-protocol";
import {MapControls, MapControlsUI} from "@here/harp-map-controls";
import {APIFormat, OmvDataSource} from "@here/harp-omv-datasource";

export default Vue.extend({
  name: "MapViewer",

  props: {
    /** The HERE XYZ access token */
    token: {type: String, required: true},
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
  },

  data() {
    return {
      /** Harp.GL map object */
      map: null as MapView | null,

      /** Extension of stylesheet for map */
      customisedTheme: {
        extends: "https://unpkg.com/@here/harp-map-theme@latest/resources/berlin_tilezen_effects_streets.json",
        styles: {
          markerStyleSet: [{
            when: "$geometryType == 'point'",
            technique: "circles",
            renderOrder: 1000, // Render the markers above other objects on the map
            attr: {
              color: "#7ED321",
              size: 15
            }
          }]
        }
      } as Theme,
    }
  },

  mounted() {
    this.map = this.createMapCanvas();
    this.initialiseBaseDataSources();

    this.map.lookAt({
      target: new GeoCoordinates(this.initLat, this.initLong)
    });

  },

  methods: {
    /** Creates and returns MapView bound to HTMLCanvasElement #map */
    createMapCanvas(): MapView {
      const map = new MapView({
        canvas: this.$refs.map as HTMLCanvasElement,
        theme: this.customisedTheme,
      });

      // Add control buttons to map
      const controls = new MapControls(map);
      const ui = new MapControlsUI(controls, {projectionSwitch: true});

      const mapElement = this.$refs.map as Element;
      mapElement.parentElement?.appendChild(ui.domElement);

      // Make map fullscreen
      map.resize(window.innerWidth, window.innerHeight);

      // Make map sizing responsive to window size
      window.addEventListener("resize", () => {
        map.resize(window.innerWidth, window.innerHeight);
      });
      return map;
    },

    /** Adds base layer vector and raster data sources from Here XYZ to map */
    initialiseBaseDataSources() {
      if (this.token) {
        const omvDataSource = new OmvDataSource({
          baseUrl: "https://xyz.api.here.com/tiles/herebase.02",
          apiFormat: APIFormat.XYZOMV,
          styleSetName: "tilezen",
          authenticationCode: this.token,
        });
        this.map?.addDataSource(omvDataSource);
      } else {
        console.error(`Invalid HERE XYZ token: ${this.token}. Make sure you have a VUE_APP_HEREAPI environment variable set. Check the README for more info`);
      }
    },
  }
})
</script>

<style scoped>
/* Renders the canvas below other objects and full screen */
div.full-screen-map > canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
}
</style>
