const mainColor = '#108ee9'

module.exports = {
  jupyterServer: 'http://localhost:8888/api/contents/',
  // jupyterServer: 'http://10.52.14.182:8888/api/contents/',
  // jupyterServer: 'http://122.224.116.44:9001/api/contents/',

  // server api
  flaskServer: 'http://localhost:5000',
  // flaskServer: 'http://10.52.14.182:5000',
  // flaskServer: 'http://122.224.116.44:5005',

  //jupyter
  baseUrl: 'http://localhost:8888',
  // baseUrl: 'http://10.52.14.182:8888',
  // baseUrl: 'http://122.224.116.44:9001',

  // assets
  assetsUrl: 'http://122.224.116.44:8008',

  mainColor,

  stepStyle: {
    mainColor,
    beacon: {
      inner: mainColor,
      outer: mainColor,
    },
  }
}
