import * as path from 'path'
import { request } from '@jupyterlab/services'

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


export function getApp({appId, version, onJson}) {
    return request(`pyapi/apps/${appId}?used_datasets=true`, undefined, {onJson})
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

export function addDatasetToApp({appId, datasetId, onJson}) {
    return request(`pyapi/apps/add_used_dataset/${appId}`, {
        method: 'put',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            used_dataset: datasetId,
        }),
    }, { onJson })
}


export function removeDatasetInApp({appId, datasetId, onJson}) {
    return request(`pyapi/apps/remove_used_dataset/${appId}`, {
        method: 'put',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            used_dataset: datasetId,
        }),
    }, {onJson})
}