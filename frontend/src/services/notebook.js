import { request, config } from '../utils'

const { CORS, kubeServer, api, hubPrefix } = config
const { playground } = api

export function startNotebook(payload) {
  const { projectId } = payload
  return request(`${CORS}${playground}${projectId}`)
}

export function createNotebook(payload) {
  const { projectId } = payload
  return request(`${CORS}${playground}${projectId}`, { method: 'post' })
}

export function enterNotebook(payload) {
  const { port } = payload
  return request(`${kubeServer}`.replace('8888', port))
}

export function openNotebook(payload) {
  const { path, port } = payload
  return request(`${kubeServer}`.replace('8888', port) + path)
}

export function startLab(payload) {

  const { hubUserName, hubToken, onSuccess } = payload
  return request(`${hubPrefix}/hub/api/users/${hubUserName}/server`, {
    method: 'post',
    headers: {
      'Authorization': `token ${hubToken}`,
    },
    noErrorMsg: true
  }, { onSuccess })
}

export function deleteLab(payload) {
  const { hubUserName, hubToken } = payload
  return request(`${hubPrefix}/hub/api/users/${hubUserName}/server`, {
    method: 'delete',
    headers: {
      'Authorization': `token ${hubToken}`,
    },
  })
}

export function getLabConfig(payload) {
  const { hubUserName, hubToken, onSuccess } = payload
  return request(`${hubPrefix}/user/${hubUserName}/lab`, {
    method: 'get',
    headers: {
      'Authorization': `token ${hubToken}`,
    },
  }, { onSuccess })
}
