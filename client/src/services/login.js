import { request, config } from '../utils';
const { api } = config;
const { userLogin } = api;
const { CORS } = config;

export async function login (data) {
  return request({
    url: CORS + userLogin,
    method: 'post',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    data,
  })
}
