export default {
  "entry": "src/index.js",
  "env": {
    "development": {
      "extraBabelPlugins": [
        "dva-hmr",
        "transform-runtime",
        ["import", { "libraryName": "antd", "style": "css" }]
      ]
    },
    "production": {
      "extraBabelPlugins": [
        "transform-runtime",
        ["import", { "libraryName": "antd", "style": "css" }]
      ]
    }
  },
  "publicPath": "./public",
  "proxy": {
    "/api": {
      "target": "http://localhost:5000/",
      "changeOrigin": true,
      "pathRewrite": { "^/api" : "" }
    },
  },
  "theme": {
    "primary-color": "#34C0E2",
  },
}
