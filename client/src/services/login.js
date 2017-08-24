import { request, config } from '../utils';
const { api } = config;
const { userLogin } = api;
const { CORS } = config;

export async function login (data) {
  console.log(CORS)
  return request({
    url: CORS[0] + userLogin,
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  })
}
