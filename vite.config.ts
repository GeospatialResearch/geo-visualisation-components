// vite.config.js
import {resolve} from 'path'
import {defineConfig} from 'vite'
import {fileURLToPath} from "node:url";
import {viteStaticCopy} from "vite-plugin-static-copy";
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    vue(),
    viteStaticCopy({
      targets: [
          {src: './node_modules/cesium/Build/Cesium/Assets', dest: './'},
          {src: './node_modules/cesium/Build/Cesium/ThirdParty', dest: './'},
          {src: './node_modules/cesium/Build/Cesium/Widgets', dest: './'},
          {src: './node_modules/cesium/Build/Cesium/Workers', dest: './'},
      ]
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./lib', import.meta.url))
    }
  },
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, 'lib/main.ts'),
      formats: ['es']
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['vue'],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
})
