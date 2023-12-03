const {defineConfig} = require("@vue/cli-service");
const CopyWebpackPlugin = require("copy-webpack-plugin")
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const path = require('path');

const cesiumSource = 'node_modules/cesium/Source';

module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    plugins: [
      new NodePolyfillPlugin(),
      new CopyWebpackPlugin({
        patterns: [
          {from: path.join(cesiumSource, '../Build/Cesium/Workers'), to: 'Workers'},
          {from: path.join(cesiumSource, 'Assets'), to: 'Assets'},
          {from: path.join(cesiumSource, 'Widgets'), to: 'Widgets'}
        ]
      }),
    ],
  },
});
