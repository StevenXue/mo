import { request, config } from '../utils'
import requestPro, {customRequest} from '../utils/requestPro'
import {formatParam} from '../utils'
const { CORS } = config
const prefix = '/user'

export function setStarFavor(payload) {
  return request(`${CORS}/user/action_entity/${payload.entity_id}`, {
    method: 'put',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action : payload.action,
      entity : payload.entity
    }),
  },);
}

export function getStarFavor({payload, onJson}) {
  let params = ''
  for (let key in payload) {
    if (!payload.hasOwnProperty(key)) {
      continue
    }
    if (payload[key]) {
      const value = payload[key]
      params += `&${key}=${value}`
    }
  }
  return request(`${CORS}/user/action_entity?${params}`, undefined, { onJson });
}


export function getUserInfo({user_ID}) {
  return request(`${CORS}/user/profile/${user_ID}`)
}


export const getFavorApps = async (payload, callback, onSuccess, onError) => {
  // return request(`${prefix}/favor_apps`, {
  //   method: 'get',
  // })
  const {pageNo: page_no, pageSize: page_size} = payload
  return await customRequest(
    `${prefix}/action_entity?${formatParam({page_no, page_size, action_entity: "favor_apps"})}`,
    {},
    callback,
    onSuccess,
    onError
  )
}


export function updateUserInfo({ body, onJson }) {
  return request(`${CORS}/user`, {
    method: 'put',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  }, { onJson });
}

export function updateUserAccount({ body, onError, onJson }) {
  return request(`${CORS}/user/account`, {
    method: 'put',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  }, { onError, onJson });
}



export function twoStepVFC(payload) {
  return request(CORS + "/user/two_step_vfc", {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
}

export function sendCaptchaToEmail(payload) {
  return request(`${CORS}/user/send_verification_code_to_email/${payload.email}`)
}
