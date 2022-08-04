# Geo Visualisation Components

Geo Visualisation Components is a web-visualisation library for geospatial data. In early development by Geospatial Research Institute Toi Hanagarau and written in TypeScript.



## Getting Started

### Requirements
#### Required Software
* [Node.JS / npm](https://nodejs.org) (**N**ode **P**ackage **M**anager)
  
#### Required Credentials
* [Cesium access token](https://cesium.com/ion/tokens) (API token to retrieve map data from Cesium)

### Installing the library into an existing Vue project

See [Digital Twins](https://github.com/GeospatialResearch/Digital-Twins/tree/master/visualisation) for an example of a Vue app using this library.

1. Install geo-visualisation-components directly from release:  
   `npm install --save https://github.com/GeospatialResearch/geo-visualisation-components/releases/download/v0.0.3.alpha.1/geo-visualisation-components-0.0.3.tgz`  
    _Note: This is temporary until we release on NPM._
   
5. Configure WebPack to copy Cesium assets into the public served folder. 
   See [Digital Twins/visualisation/vue.config.js](https://github.com/GeospatialResearch/Digital-Twins/blob/21-integrate-visualisation-library/visualisation/vue.config.js) for an example of this.  
   _Note: This library defaults CESIUM_BASE_URL to './', if you change this then you will have to change the file structure shown in the config file and vice versa._
   


### Repository structure

```tree
geo-visualisation-components
├──build/    Configuration files for building the library from source
├──dev/      Small example Vue app used for testing and development
├──dist/     Built library files
├──public/   Assets to be served. Some of these are auto-generated in the build stage.
└──src/      Library souce
    └───components/   Reusable Vue Components. One or many components can make a webpage
```

## Contributions

Please see our [Issue Tracker](https://github.com/GeospatialResearch/geo-visualisation-components/issues) for details on coming
features and additions to the software.

There is no current expectations of contributions to this project. We accept input in code reviews now. If you would
like to be involved in the project, please contact the maintainer.


## Contacts
Maintainer: Luke Parkinson [@LukeParky](https://github.com/LukeParky/)
[luke.parkinson@canterbury.ac.nz](mailto:luke.parkinson@canterbury.ac.nz)

## License
[MIT](LICENSE)
