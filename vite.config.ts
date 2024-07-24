import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import typescript2 from 'rollup-plugin-typescript2';
import dts from "vite-plugin-dts";
import {viteStaticCopy} from 'vite-plugin-static-copy'
import sassDts from 'vite-plugin-sass-dts'
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
import path from "path";
import {fileURLToPath} from "node:url";

export default defineConfig({
  plugins: [
    vue(),
    cssInjectedByJsPlugin(),
    dts({
      insertTypesEntry: true,
      rollupTypes: true,
    }),
    sassDts(),
    cssInjectedByJsPlugin(),
    viteStaticCopy({
      targets: [
        {src: './node_modules/cesium/Build/Cesium/Assets', dest: './'},
        {src: './node_modules/cesium/Build/Cesium/ThirdParty', dest: './'},
        {src: './node_modules/cesium/Build/Cesium/Widgets', dest: './'},
        {src: './node_modules/cesium/Build/Cesium/Workers', dest: './'},
      ]
    }),
    typescript2({
      check: false,
      include: ["lib/components/**/*.vue"],
      tsconfigOverride: {
        compilerOptions: {
          outDir: "dist",
          sourceMap: true,
          declaration: true,
          declarationMap: true,
        },
      },
      exclude: ["vite.config.ts"],
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./lib', import.meta.url))
    }
  },
  build: {
    cssCodeSplit: true,
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: "lib/components/index.ts",
      name: "geo-visualisation-components",
      formats: ["es", "umd"],
      fileName: (format) => `geo-visualisation-components.${format}.js`,
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      input: {
        main: path.resolve(__dirname, "lib/main.ts"),
      },
      external: ["vue"],
      output: {
        exports: "named",
        globals: {
          vue: "Vue",
        },
      },
    },
  },
})
