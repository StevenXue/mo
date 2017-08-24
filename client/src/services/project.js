import { request, config } from '../utils'
import { jupyterServer } from '../constants'

const { api, CORS } = config
const { dataSets, projects, getDataFields, publish, fork, files, getStagingData, neuralStyle, toolkits, unpublish, servedModel } = api

let cors = CORS[0]

export async function query (user_ID) {
  let query = `?user_ID=${user_ID}`
  return request({
    url: cors + projects + query,
    method: 'get',
  })
}

export async function deploy (_id, data) {
  return request({
    url: cors + servedModel + '/deploy/' + _id,
    method: 'post',
    data
  })
}

export async function getNotebookFile (user_id, project) {
  return request({
    url: jupyterServer + user_id+ '/' + project,
    method: 'get'
  })
}

export async function getNotebookContent (notebookPath) {
  return request({
    url: jupyterServer + notebookPath,
    method: 'get'
  })
}

export async function publishProject (project_id) {
  return request({
    url: cors + publish + '/' + project_id,
    method: 'put',
  })
}

export async function unpublishProject (project_id) {
  return request({
    url: cors + unpublish + '/' + project_id,
    method: 'put',
  })
}

export async function listToolkits () {
  return request({
    url: cors + toolkits,
    method: 'get',
  })
}

export async function getStagedData (project_id) {
  let query = `?project_id=${project_id}`
  return request({
    url: cors + getStagingData + query,
    method: 'get',
  })
}

export async function convertToStaging (data) {
  return request({
    url: cors + getStagingData,
    method: 'post',
    data,
  })
}

export async function forkProject (project_id, user_Id) {
  let query = `?user_ID=${user_Id}`
  console.log(query)
  return request({
    url: cors + fork + '/' + project_id + query,
    method: 'post',
  })
}

export async function create (data) {
  return request({
    url: cors + projects,
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
    url: cors + dataSets + query,
    method: 'get',
  })
}

export async function listFiles (user_ID, extension, predict) {
  let query = `?user_ID=${user_ID}&predict=${predict}`
  if (extension) {
    query += `&extension=${extension}`
  }
  return request({
    url: cors + files + query,
    method: 'get',
  })
}

export async function listDataFields (data_set_id) {
  return request({
    url: cors + getDataFields + '/' + data_set_id,
    method: 'get',
  })
}

export async function predictNeuralStyle (data) {
  return request({
    url: cors + neuralStyle,
    method: 'post',
    data,
  })
}
