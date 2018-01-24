import request from "../utils/requestPro"

const prefix = "/module"

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
