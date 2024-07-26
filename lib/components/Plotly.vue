<template>
  <div>
    <div id="plot" />
  </div>
</template>

<script lang="ts">
import type {PropType} from "vue";
import {defineComponent} from "vue";
import Plotly from 'plotly.js-basic-dist-min'
import type {Config, Data, Layout} from "plotly.js";

export default defineComponent({
  name: "Plotly",

  mounted() {
    this.refreshPlot();
  },

  props: {
    data: {
      type: Object as PropType<Data[]>,
      required: true,
    },
    layout: {
      type: Object as PropType<Partial<Layout>>,
      default() {
        return {title: "Plot"}
      }
    },
    config: {
      type: Object as PropType<Partial<Config>>,
      default() {
        return {scrollZoom: true}
      }
    }
  },

  watch: {
    data() {
      this.refreshPlot();
    },
    layout() {
      this.refreshPlot();
    },
    config() {
      this.refreshPlot();
    }
  },
  methods: {
    refreshPlot() {
      console.log('refresh')
      console.log(Plotly)
      Plotly.newPlot('plot', this.data, this.layout, this.config)
    }
  }
});
</script>
