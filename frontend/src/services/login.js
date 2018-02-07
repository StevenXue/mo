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
  })
}

export function tokenLogin(params) {
  return request(CORS + refreshToken, {
    method: 'get',
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('token'),
    },
  })
}
