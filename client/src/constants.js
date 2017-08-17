const mainColor = '#108ee9'

module.exports = {
  jupyterBase: 'http://localhost:8888/',
  jupyterServer: 'http://localhost:8888/api/contents/',
  // jupyterServer: 'http://10.52.14.182:8888/api/contents/',

  // server api
  flaskServer: 'http://localhost:5000',
  // flaskServer: 'http://10.52.14.182:5000',

  //jupyter
  baseUrl: 'http://localhost:8888',
  // baseUrl: 'http://10.52.14.182:8888',

  // assets
  assetsUrl: 'http://10.52.14.182:3090',

  mainColor,

  stepStyle: {
    mainColor,
    beacon: {
      inner: mainColor,
      outer: mainColor,
    },
  }
}
