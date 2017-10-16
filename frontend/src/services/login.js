import { request, config } from '../utils'

const { CORS, api } = config
const { userLogin } = api

export async function login (body) {
  return request(CORS[0] + userLogin, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
  })
}
