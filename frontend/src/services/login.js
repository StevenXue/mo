import { request, config } from '../utils'

const { CORS, api } = config
const { userLogin, refreshToken } = api

export function login(body) {
  return request(CORS + userLogin, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),

    customErrorMsg: true,
    noErrorMsg: true,
  })
}


export function loginWithPhone(payload) {
  return request(CORS + "/user/login_with_phone", {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      phone: payload.phone,
      code: payload.code
    }),
  })
}


export function tokenLogin(params) {
  return request(CORS + refreshToken, {
    method: 'get',
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('token'),
    },
    noErrorMsg: true
  })
}
