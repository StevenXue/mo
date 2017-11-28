export default {
  "entry": "src/index.js",
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
  "proxy": {
    "/api": {
      "target": "http://localhost:5000/",
      "changeOrigin": true,
      "pathRewrite": { "^/api" : "" }
    },
  },
  "theme": {
    "primary-color": "#34C0E2",
    "font-family": "Roboto",
    'text-color': 'fade(#000, 90%)',
    // "font-family": "Helvetica Neue","Helvetica","PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑", "Arial", "sans-serif"

// "font-size-base": "30px"
  },
}
