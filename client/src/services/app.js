import { request, config } from '../utils'
const { api, CORS } = config
const { user, userLogout, userLogin, refreshToken } = api

export async function login (params) {
  return request({
    url: userLogin,
    method: 'post',
    data: params,
  })
}

export async function logout (params) {
  return request({
    url: userLogout,
    method: 'get',
    data: params,
  })
}

export async function query (params) {
  return request({
    url: CORS + refreshToken,
    method: 'get',
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    }
  })
}
