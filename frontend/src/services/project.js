
import { request, config } from '../utils';

const { CORS, api } = config
const { projects } = api

// 获取用户所有 projects
export function fetchProjects(user_ID) {
  return request(`${CORS}${projects}?user_ID=${user_ID}`);
}

