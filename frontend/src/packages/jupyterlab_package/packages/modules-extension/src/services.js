import request from './request'
import * as path from "path"

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

const prefix = "/module"

export function getModules(onSuccess) {
  return request(`pyapi/${prefix}/module_list`, null, {onSuccess})
}

export function getModule({moduleId, onJson}) {
  return request(`pyapi/${prefix}/${moduleId}?yml=true`, undefined, {onJson})
}

export function addModuleToApp({appId, moduleId}) {
  return request(`pyapi/app/add_used_module/${appId}`, {
    method: 'put',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      used_modules: [moduleId]
    })
  })
}


// 新建 module
export function createModule(payload) {
  return request(`${prefix}`, {
    method: 'POST',
    body: {
      user_ID:payload.user_ID,
      name:payload.name,
      description: payload.description
    }
  });
}

export function fetchModuleList(payload) {
  return request(`${prefix}/module_list`);
}


export function fetchModule(payload) {
  return request(`${prefix}/${payload.moduleId}`);
}

export function updateModule(payload) {
  return request(`${prefix}/update_module`, {
    method: 'POST',
    body: {
      ...payload
    }
  });
}
