import {createApp} from 'vue';
import "bootstrap"

import "bootstrap/dist/css/bootstrap.min.css"

import Dev from './serve.vue';
// To register individual components where they are used (serve.vue) instead of using the
// library as a whole, comment/remove this import and it's corresponding "app.use" call
import GeoVisualisationComponents from '../lib/main';

const app = createApp(Dev);

app.use(GeoVisualisationComponents);

app.mount('#app');
