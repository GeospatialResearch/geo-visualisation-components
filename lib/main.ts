import type {App} from "vue";
// Import vue components
import * as components from "@/components";

export type {Bbox, MapViewerDataSourceOptions, Scenario} from './types'

// install function executed by Vue.use()
export default {
  install(app: App) {
    Object.entries(components).forEach(([componentName, component]) => {
      app.component(componentName, component);
    });
  },
};

// To allow individual component use, export components
// each can be registered via Vue.component()
export * from "@/components/index";
