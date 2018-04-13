const fs = require('fs');
const path = require('path');
// const re = /src\/jupyterlab\/packages\/.+\/style\/.+\.css$/
const re = /.+\.css$/;
const paths = require('./paths');

import {flaskServer, hubServer, tbServer} from './config.js'

const walkSync = (dir) =>
  fs.readdirSync(dir)
    .reduce((files, file) =>
        fs.statSync(path.join(dir, file)).isDirectory() ? files.concat(walkSync(path.join(dir, file))) : files.concat(path.join(dir, file)),
      []);
const jupyterPackageCSS = walkSync('./src/packages/jupyterlab_package/packages/').filter(file => re.test(file))

export default {
  'entry': ['whatwg-fetch', 'src/index.js'],
  'env': {
    'development': {
      'extraBabelPlugins': [
        'dva-hmr',
        'transform-runtime',
        ['import', {'libraryName': 'antd', 'style': true}],
      ],
    },
    'production': {
      'extraBabelPlugins': [
        'transform-runtime',
        ['import', {'libraryName': 'antd', 'style': true}],
      ],
    },
  },
  // TODO upload roadhog to 2.x to support alias
  'alias': {
    'config': paths.config,
  },
  'cssModulesExclude': [
    ...jupyterPackageCSS,
  ],
  'proxy': {
    '/pyapi': {
      'target': flaskServer,
      'changeOrigin': true,
      'pathRewrite': {'^/pyapi': ''},
    },
    '/tb': {
      'target': tbServer,
      'changeOrigin': true,
      // 'pathRewrite': {'^/tb': ''},
    },
    '/hub_api': {
      'target': hubServer,
      'changeOrigin': true,
      'ws': true,
      'pathRewrite': {'^/hub_api': ''},
      'onProxyReq': function onProxyReq(proxyReq, req, res) {
        if (req.headers.accept.indexOf('image') !== -1) {
          // add custom header to request
          proxyReq.setHeader('Authorization', 'token 1d4afa72b00c4ffd9db82f26e1628f89')
        }
      },
    },
  },
  'theme': {
    'primary-color': '#34C0E2',
    // "font-family": "Roboto",
    'text-color': 'fade(#000, 90%)',
    // "font-family": "Helvetica Neue","Helvetica","PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑", "Arial", "sans-serif"

// "font-size-base": "30px"
  },
}
