import { config } from './utils';
const { CORS } = config;

module.exports = {
  // jupyterServer: 'http://localhost:8888/api/contents/',
  jupyterServer: 'http://10.52.14.182:8888/api/contents/',

  // server api
  flaskServer: CORS,
}
