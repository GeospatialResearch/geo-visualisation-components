import * as Cesium from "cesium";

export interface MapViewerDataSourceOptions {
  // Cesium Ion assets
  ionAssetIds?: number[]

  imageryProviders?: Cesium.ImageryProvider[]

  // External data source assets
  geoJsonDataSources?: Cesium.GeoJsonDataSource[]
}

export interface Scenario extends MapViewerDataSourceOptions {
  name: string
}
