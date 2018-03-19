import path from 'path'
import { request, config } from '../utils'

const { CORS, api } = config
const { projects, fork } = api

const PREFIX = 'apps'

// 获取单个 project
export function fetchApp({ projectId, onJson }) {
  return request(`${CORS}/${PREFIX}/${projectId}?yml=true`, undefined, { onJson })
}

export const runApi = async payload => {
  return request(`${CORS}/${PREFIX}/run/${payload.app_id}`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      app: payload.app,
    }),
  })
}
