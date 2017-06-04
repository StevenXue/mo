import { request, config } from '../utils';
import { jupyterServer } from '../constants';
const { api, CORS } = config;
const { dataSets } = api;

export async function create (params) {
  return request({
    url: "new project",
    method: 'post',
    data: params,
  })
}

export async function edit (params) {
  return request({
    url: jupyterServer + params,
    method: 'get',
  })
}

export async function listDataSets (user_ID) {
  let query = `?user_ID=${user_ID}`
  console.log('url', CORS + dataSets + query);
  return request({
    url: CORS + dataSets + query,
    method: 'get',
  })
}
