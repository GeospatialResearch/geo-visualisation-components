import _Vue, {PluginFunction} from 'vue';

// Import vue components
import * as components from '@/components/index';


// install function executed by Vue.use()
/*eslint-disable @typescript-eslint/no-explicit-any */
const install: PluginFunction<any> = function installGeoVisualisationComponents(Vue: typeof _Vue) {
  Object.entries(components).forEach(([componentName, component]) => {
    Vue.component(componentName, component);
  });
};

// Create module definition for Vue.use()
export default install;

// To allow individual component use, export components
// each can be registered via Vue.component()
export * from '@/components/index';
