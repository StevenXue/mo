//SERVICES
import { request, config } from '../utils'
import { jupyterServer } from '../constants'

const { api, CORS } = config
const { servedModel, allModels } = api
let cors = CORS[0]

export async function query (user_ID) {
  console.log("serving", user_ID)
  let query = `?user_ID=${user_ID}`
  return request({
    url: cors + servedModel + allModels + query,
    method: 'get',
  })
}

export async function suspendModel (model_ID) {
  return request({
    url: cors + servedModel + '/suspend/' + model_ID,
    method: 'put',
  })
}

export async function resumeModel (model_ID) {
  return request({
    url: cors + servedModel + '/resume/' + model_ID,
    method: 'put',
  })
}

export async function deleteModel (model_ID) {
  return request({
    url: cors + servedModel + '/' + model_ID,
    method: 'delete',
  })
}

export async function terminateModel (model_ID) {
  return request({
    url: cors + servedModel + '/terminate/' + model_ID,
    method: 'put',
  })
}
