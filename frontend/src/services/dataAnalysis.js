
import request from '../utils/request';

// 获取用户所有sections
export function fetchSections() {
  return request('/api/users');
}

// 添加section
export function addSection(sectionName) {
  return request('/api/users');
}
// 删除section

// 更改section
export function updateSection(sectionName) {
  return request('/api/users');
}
