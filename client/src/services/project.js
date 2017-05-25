import { request } from '../utils'


export async function create (params) {
  return request({
    url: "new project",
    method: 'post',
    data: params,
  })
}
