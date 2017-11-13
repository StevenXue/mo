
import { request, config } from '../utils';

const { CORS, api } = config
const { projects } = api

// 获取用户 所有的project 下的 所有的 models
export function fetchModels(payload) {
  const user_ID = localStorage.getItem('user_ID')
  return request(`${CORS}/project/models/${user_ID}?privacy=all`);
}

// 获取用户所有 projects
export function fetchProjects(payload) {
  const user_ID = localStorage.getItem('user_ID')
  return request(`${CORS}${projects}?user_ID=${user_ID}&privacy=${payload.privacy}`);
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
