import request from "../utils/requestPro"

const prefix = "/world_messages"

export const sendWorldMessages = (payload) => {
  return request(`${prefix}`, {
    method: "post",
    body: {
      channel: payload.channel,
      message: payload.message,
    }

  })
}


export const getWorldMessages = (payload) => {
  return request(`${prefix}?channel=${payload.channel}`)
}



// // 新建 module
// export function createModule(payload) {
//   return request(`${prefix}`, {
//     method: 'POST',
//     body: {
//       user_ID:payload.user_ID,
//       name:payload.name,
//       description: payload.description
//     }
//   });
// }
//
// export function fetchModuleList(payload) {
//   return request(`${prefix}/module_list`);
// }
//
//
// export function fetchModule(payload) {
//   return request(`${prefix}/${payload.moduleId}`);
// }
//
// export function updateModule(payload) {
//   return request(`${prefix}/update_module`, {
//     method: 'POST',
//     body: {
//       ...payload
//     }
//   });
// }
