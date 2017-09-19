const mainColor = '#108ee9'

module.exports = {
  jupyterServer: 'http://192.168.65.2:8888/api/contents/',  // kube master node ip
  // jupyterServer: 'http://10.52.14.182:8888/api/contents/',
  // jupyterServer: 'http://122.224.116.44:9001/api/contents/',

  // server api
  flaskServer: 'http://localhost:5000',
  // flaskServer: 'http://10.52.14.182:5000',
  // flaskServer: 'http://122.224.116.44:5005',

  //jupyter
  baseUrl: 'http://192.168.65.2:8888',  // kube master node ip
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
  },

  statusColor: {
    running: '#108ee9',
    completed: '#00a854',
    terminated: '#f04134',
  }

}
