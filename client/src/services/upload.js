import { request, config } from '../utils';
const { api } = config;
const { fileUpload, fileList, dataImport } = api;
const { CORS } = config;

export async function uploadFile (data) {
  return request({
    url: CORS + fileUpload,
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
    url: CORS + fileList + query,
    method: 'get',
  })
}

export async function importData (data) {
  return request({
    url: CORS + dataImport,
    method: 'post',
    data,
  })
}
