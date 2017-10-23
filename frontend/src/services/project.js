
import { request, config } from '../utils';

const { CORS, api } = config
const { projects } = api

// 获取用户所有 projects
export function fetchProjects(payload) {
  return request(`${CORS}${projects}?user_ID=${payload.user_ID}&privacy=${payload.privacy}`);
}

// 获取单个 project
export function fetchProject(payload) {
  return request(`${CORS}${projects}/${payload.projectId}`);
}

// 新建 project
export function createProject(payload) {
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
  console.log(payload)
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
  return request(`${CORS}${projects}/${payload.projectId}?user_ID=${payload.user_ID}`, {
    method: 'delete'
  });
}
