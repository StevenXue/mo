const path = require('path')

const svgSpriteDirs = [
  path.resolve(__dirname, 'src/svg/'),
  require.resolve('antd').replace(/index\.js$/, ''),
]

export default {
  entry: 'src/index.js',
  disableCSSModules: false,
  svgSpriteLoaderDirs: svgSpriteDirs,
  // module: {
  //   noParse: /node_modules\/weblas\/dist\/weblas.js/,
  // },
  'theme': './theme.config.js',
  'env': {
    'development': {
      'extraBabelPlugins': [
        'dva-hmr',
        'transform-class-properties',
        'transform-export-extensions',
        'transform-object-rest-spread',
        'transform-runtime',
        ['import', { 'libraryName': 'antd', 'style': true }],
      ],
    },
    'production': {
      // "presets": ["babel-preset-es2015", "babel-preset-es2016", "babel-preset-es2017"].map(require.resolve),
      'extraBabelPlugins': [
        'transform-runtime',
        ['import', { 'libraryName': 'antd', 'style': true }],
      ],
      'extraBabelIncludes': [
        "./node_modules/keras-js",
      ],
    },
  },
}
