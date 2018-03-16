import path from 'path'
import { request, config } from '../utils'

const { CORS, api } = config
const { projects, fork } = api

const PREFIX = 'apps'

// 获取单个 project
export function fetchApp({ projectId, onJson }) {
  return request(`${CORS}/${PREFIX}/${projectId}?yml=true`, undefined, { onJson })
}

