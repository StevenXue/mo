import { request, config } from '../utils'

const { CORS, kubeServer, api } = config
const { playground } = api

export function startNotebook(payload) {
  const { projectId } = payload
  return request(`${CORS}${playground}${projectId}`)
}

export function createNotebook(payload) {
  const { projectId } = payload
  return request(`${CORS}${playground}${projectId}`, {method: 'post'})
}

export function enterNotebook(payload) {
  const { port } = payload
  return request(`${kubeServer}`.replace('8888', port))
}

export function openNotebook(payload) {
  const { path, port } = payload
  return request(`${kubeServer}`.replace('8888', port)+path)
}
