import * as Cesium from "cesium";

export interface MapViewerDataSourceOptions {
  // Cesium Ion assets
  ionImageryProviders?: Cesium.IonImageryProvider[]
  ionAssetIds?: number[]

  // External data source assets
  geoJsonDataSources?: Cesium.GeoJsonDataSource[]
}
