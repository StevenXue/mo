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
        "transform-runtime"
      ]
    }
  },

  "proxy": {
    "/api": {
      "target": "http://localhost:5000/",
      "changeOrigin": true,
      "pathRewrite": { "^/api" : "" }
    },

    "/api_prod": {
          "target": "http://122.224.116.44:5005/",
          "changeOrigin": true,
          "pathRewrite": { "^/api" : "" }
        }
  },
  "theme": {
    "primary-color": "#34C0E2",
  },
}
