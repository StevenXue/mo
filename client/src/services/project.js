import { request } from '../utils';
import { jupyterServer } from '../constants';


export async function create (params) {
  return request({
    url: "new project",
    method: 'post',
    data: params,
  })
}

export async function edit (params) {
  return request({
    url: jupyterServer + params,
    method: 'get',
  })
}
