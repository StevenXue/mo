import request, { org_request } from './request'

const prefix = "/modules"

export function getModules(onSuccess) {
  return org_request(`pyapi/${prefix}/module_list`, null, onSuccess)
}

export function getModule(payload, onSuccess) {
  return org_request(`pyapi/${prefix}/${payload.moduleId}?yml=true`, null, onSuccess)
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
