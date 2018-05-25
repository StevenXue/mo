// import request from './request'
import { request } from '@jupyterlab/services'
import { message } from 'antd'
import * as path from 'path'

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

export function getFavs({ onJson, fav_entity, page_no }) {
  const pageParam = page_no !== undefined ? `&page_no=${page_no}` : ''
  return request(path.join('/pyapi', 'user/action_entity') +
    `?user_ID=${localStorage.getItem('user_ID')}&action_entity=${fav_entity}` + pageParam, undefined, { onJson })
}

// const prefix = 'modules'

export function getProject({ projectId, version, onJson, prefix }) {
  if (version) {
    version = version.split('.').join('_')
    return request(`pyapi/${prefix}s/${projectId}?version=${version}&yml=true`, undefined, { onJson })
  } else {
    return request(`pyapi/${prefix}s/${projectId}?yml=true`, undefined, { onJson })
  }
}

export function getApp({ appId, version, onJson, prefix }) {
  return request(`pyapi/apps/${appId}?used_${prefix}s=true`, undefined, { onJson })
}

export function getAppActionEntity({ appId, version, onJson, actionEntity }) {
  return request(`pyapi/apps/get_action_entity/${appId}?action_entity=${actionEntity}`, undefined, { onJson })
}

export function addModuleToApp({ appId, moduleId, func, version, onJson }) {
  if (version) {
    version = version.split('.').join('_')
  }
  return request(`pyapi/apps/add_used_module/${appId}`, {
    method: 'put',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      used_module: moduleId,
      func,
      version,
    }),
  }, { onJson })
}

export function addDatasetToApp({ appId, datasetId, onJson }) {
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

export function removeUsedEntityInApp({ pageType, appId, entityId, version, onJson }) {
  if(version) {
    version = version.split('.').join('_');
  }
  return request(`pyapi/apps/remove_used_${pageType}/${appId}`, {
    method: 'put',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      [`used_${pageType}`]: entityId,
      version,
    }),
  }, { onJson })
}

export function getHotTagOfProject({ payload, onJson }) {
  const searchQuery = payload.searchQuery
  const projectType = payload.objectType
  return request(`pyapi/project/get_hot_tag?search_query=${searchQuery}&project_type=${projectType}`, undefined, { onJson })
}

