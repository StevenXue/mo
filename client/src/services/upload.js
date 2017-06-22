import { request, config } from '../utils';
const { api, CORS } = config;
const { files, dataSets } = api;

export async function uploadFile (data) {
  return request({
    url: CORS + files,
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    data,
  })
}

export async function fetchFileList (user_ID) {
  let query = `?user_ID=${user_ID}`
  return request({
    url: CORS + files + query,
    method: 'get',
  })
}

export async function importData (data) {
  return request({
    url: CORS + dataSets,
    method: 'post',
    data,
  })
}
