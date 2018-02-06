
import { request, config } from '../utils';

const { CORS, api } = config
const { projects, fork } = api

// 获取用户 所有的project 下的 所有的 deploy 过的 models
// export function fetchDeployment(payload) {
//   const user_ID = localStorage.getItem('user_ID')
//   return request(`${CORS}/served_models/${user_ID}?privacy=all`);
// }

// 获取用户所有 projects
export function fetchProjects(payload) {
  const user_ID = localStorage.getItem('user_ID')
  if (payload.others) {
    return request(`${CORS}${projects}?user_ID=${user_ID}&others=true`)
  } else {
    return request(`${CORS}${projects}?user_ID=${user_ID}&privacy=${payload.privacy}`);
  }
}

// 获取单个 project
export function fetchProject(payload) {
  return request(`${CORS}${projects}/${payload.projectId}`);
}

// 新建 project
export function createProject(payload) {
  payload.body.user_ID = localStorage.getItem('user_ID')
  return request(`${CORS}${projects}`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(payload.body),
  });
}

// 更新 project
export function updateProject(payload) {
  return request(`${CORS}${projects}/${payload.projectId}`, {
    method: 'put',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload.body),
  });
}

// 删除 project
export function deleteProject(payload) {
  const user_ID = localStorage.getItem('user_ID')
  return request(`${CORS}${projects}/${payload.projectId}?user_ID=${user_ID}`, {
    method: 'delete'
  });
}

// fork project
export function forkProject(prjID) {
  const user_ID = localStorage.getItem('user_ID')
  return request(`${CORS}${fork}/${prjID}?user_ID=${user_ID}`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
