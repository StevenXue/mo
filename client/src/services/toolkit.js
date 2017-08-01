import { request, config } from '../utils';
const { api } = config;
const { userLogin } = api;
const { CORS } = config;

export async function getToolkit() {
  return request({
    url: CORS + '/toolkit/toolkits/public',
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
    },
  })
}
