import path from 'path'
import { request, config } from '../utils'

const { CORS, api } = config
const { projects, fork } = api

const PREFIX = 'apps'

// 获取单个 project
export function fetchApp({ projectId, version, onJson }) {
  if (version) {
    version = version.split('.').join('_');
    return request(`pyapi/apps/${projectId}?version=${version}&yml=true`, undefined, {onJson})
  } else {
    return request(`pyapi/apps/${projectId}?yml=true`, undefined, {onJson})
  }
}

export const runApi = async payload => {
  return request(`${CORS}/${PREFIX}/run/${payload.app_id}`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      app: payload.app,
      version: payload.version.split('.').join('_')
    }),
  })
}
