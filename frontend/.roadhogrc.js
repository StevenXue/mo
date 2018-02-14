const fs = require('fs');
const path = require('path');
// const re = /src\/jupyterlab\/packages\/.+\/style\/.+\.css$/
const re = /.+\.css$/
const paths = require('./paths');

const walkSync = (dir) =>
  fs.readdirSync(dir)
    .reduce((files, file) =>
        fs.statSync(path.join(dir, file)).isDirectory() ?
          files.concat(walkSync(path.join(dir, file))) :
          files.concat(path.join(dir, file)),
      []);
const jupyterPackageCSS = walkSync('./src/packages/jupyterlab_package/packages/').filter(file => re.test(file))

export default {
  "entry": ['whatwg-fetch', 'src/index.js'],
  "env": {
    "development": {
      "extraBabelPlugins": [
        "dva-hmr",
        "transform-runtime",
        ["import", { "libraryName": "antd", "style": true }]
      ]
    },
    "production": {
      "extraBabelPlugins": [
        "transform-runtime",
        ["import", { "libraryName": "antd", "style": true }]
      ]
    }
  },
  // TODO upload roadhog to 2.x to support alias
  "alias": {
    'config': paths.config
  },
  "cssModulesExclude": [
    ...jupyterPackageCSS
  ],
  "proxy": {
    "/pyapi": {
      "target": "http://localhost:5000/",
      "changeOrigin": true,
      "pathRewrite": { "^/pyapi" : "" }
    },
    "ws://localhost:8989/hub_api": {
      "target": "ws://localhost:8000/",
      "changeOrigin": true,
      "ws": true,
      "pathRewrite": { "^/hub_api" : "" }
    },
    "/hub_api": {
      "target": "http://localhost:8000/",
      "changeOrigin": true,
      "pathRewrite": { "^/hub_api" : "" }
    },
  },
  "theme": {
    "primary-color": "#34C0E2",
    // "font-family": "Roboto",
    'text-color': 'fade(#000, 90%)',
    // "font-family": "Helvetica Neue","Helvetica","PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑", "Arial", "sans-serif"

// "font-size-base": "30px"
  },
}
