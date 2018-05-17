import {request} from "../utils"

const prefix = "/pyapi/modules"

// 新建 module
export function createModule(payload) {
  return request(`${prefix}`, {
    method: 'POST',
    body: JSON.stringify({
      user_ID:payload.user_ID,
      name:payload.name,
      description: payload.description
    })
  });
}

export function fetchModuleList(payload) {
  return request(`${prefix}/module_list`);
}


export function fetchModule({projectId}) {
  return request(`${prefix}/${projectId}`);
}

export function updateModule(payload) {
  return request(`${prefix}/update_module`, {
    method: 'POST',
    body: JSON.stringify({
      ...payload
    })
  });
}
