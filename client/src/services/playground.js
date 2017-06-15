import { request } from '../utils'

export async function spawn (data) {
  return request({
    url: 'http://localhost:8888/api/contents/mine',
   //url: 'http://10.52.14.182:8888/api/contents/mine',
    method: 'post',
    data,
  })
}
