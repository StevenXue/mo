const mainColor = '#108ee9';

module.exports = {
  apiPrefix: '/pyapi',
//apiPrefix: 'http://192.168.31.7:5005'
  // apiPrefix: 'http://122.224.116.44:5005',

  jupyterServer: 'http://10.52.14.182:8888/api/contents/',  // kube master node ip
  kubeServer: 'http://10.52.14.182:8888/api/contents/',  // kube master node ip
  gitServerIp: '192.168.31.7',
  // jupyterServer: 'http://10.52.14.182:8888/api/contents/',
  // jupyterServer: 'http://122.224.116.44:9001/api/contents/',

  // server api
  //flaskServer: 'http://localhost:5005', // dev
  // flaskServer: 'http://10.52.14.182:5005',
  // flaskServer: 'http://122.224.116.44:5005',
  flaskServer: 'http://192.168.31.7:5005', // prod

  //hubServer: 'http://localhost:8000', // dev
  hubServer: 'http://192.168.31.7:8000', // prod

  //jupyter
  kubeBaseUrl: 'http://10.52.14.182:8888',  // kube master node ip
  // baseUrl: 'http://10.52.14.182:8888',
  // baseUrl: 'http://122.224.116.44:9001',
  //
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
    Running: '#108ee9',
    Completed: '#00a854',
    Terminated: '#f04134',
  },

  privacyChoices: [
    {value: 'all', text: 'Privacy'},
    {value: 'private', text: 'Private'},
    {value: 'public', text: 'Public'}
  ],

  projectChoices: [
    {value: 'project', text: 'Project Type'},
    {value: 'app', text: 'App'},
    {value: 'module', text: 'Module'},
    {value: 'dataset', text: 'Dataset'},
  ],

  dataCategory: [
    'Business', 'Government', 'Education', 'Environment',
    'Health', 'Housing & Development', 'Public Services',
    'Social', 'Transportation', 'Science', 'Technology'
  ],


  translateDict: {
    'dataAnalysis': 'toolkit',
    'modelling': 'model',
  },

  tempVariable: {
    // nameOrId: '_id',
    nameOrId: 'name',
  },

  statusDict: {
    0: 'ready',
    100: 'running',
    200: 'done',
    300: 'error'
  },

  defaultOverviewDocs:{'text':"## Overview\n" +
    "\n" +
    "_Provide a short overview of your algorithm that explains the value and primary use cases._\n" +
    "\n" +
    "## Usage\n" +
    "\n" +
    "### Input\n" +
    "\n" +
    "_Describe the input fields for your algorithm. For example:_\n" +
    "\n" +
    "\n" +
    "| Parameter | Description |\n" +
    "| --------- | ----------- |\n" +
    "| field     | Description of field |\n" +
    "\n" +
    "### Output\n" +
    "\n" +
    "_Describe the output fields for your algorithm. For example:_\n" +
    "\n" +
    "\n" +
    "| Parameter | Description | \n" +
    "| --------- | ----------- | \n" +
    "| field     | Description of field | \n" +
    "\n" +
    "## Examples\n" +
    "\n" +
    "_Provide and explain examples of input and output for your algorithm._\n" +
    "\n"}

};

