import * as path from 'path'
import request from './request'

const prefix = 'data'

const PREFIX = 'project'

// 获取用户所有 projects
export function getProjects({ filter, onJson }) {
  let params = ''
  for (let key in filter) {
    if (!filter.hasOwnProperty(key)) {
      continue
    }
    if (filter[key]) {
      const value = filter[key]
      if (key === 'projectType') {
        key = 'type'
      }
      params += `&${key}=${value}`
    }
  }
  return request(path.join('/pyapi', PREFIX) + `?${params}`, undefined, { onJson })
}

export function getDatasets(onSuccess) {
  console.log('getDatasets')
  return request(`pyapi/${prefix}/data_sets`, {
    method: 'get',
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    },
  }, { onSuccess })
}
