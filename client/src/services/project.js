import { request, config } from '../utils';
import { jupyterServer } from '../constants';
const { api, CORS } = config;
const { dataSets, projects, getDataFields } = api;

export async function query (user_ID) {
  let query = `?user_ID=${user_ID}`
  return request({
    url: CORS + projects + query,
    method: 'get',
  })
}

export async function create (data) {
  return request({
    url: CORS + projects,
    method: 'post',
    data,
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
  return request({
    url: CORS + dataSets + query,
    method: 'get',
  })
}

export async function listDataFields (data_set_id) {
  return request({
    url: CORS + getDataFields + '/' + data_set_id,
    method: 'get',
  })
}
