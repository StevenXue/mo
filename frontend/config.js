const conf = {
  DEV: {
    // server api
    flaskServer: 'http://localhost:5005',
    // flaskServer: 'http://10.52.14.182:5005',
    // flaskServer: 'http://122.224.116.44:5005',
    // flaskServer: 'http://192.168.31.7:5005',

    hubServer: 'http://localhost:8000',
    // hubServer: 'http://192.168.31.7:8000',

    docsServer: 'http://localhost:3000',

    tbServer: 'http://localhost:8111',

    gitServerIp: '10.52.14.182',

    webServer: 'http://192.168.31.6',

    env: 'DEV',
  },
  PROD: {
    // server api
    // flaskServer: 'http://localhost:5005',
    // flaskServer: 'http://10.52.14.182:5005',
    // flaskServer: 'http://122.224.116.44:5005',
    flaskServer: 'http://momodel.ai/pyapi',

    // hubServer: 'http://localhost:8000',
    hubServer: 'http://momodel.ai/hub_api',

    docsServer: 'http://localhost:3000',

    tbServer: 'http://localhost:8111',

    gitServerIp: 'momodel.ai',

    webServer: 'http://momodel.ai',

    env: 'PROD'

  }
}

module.exports = conf.DEV
// module.exports = conf.PROD

