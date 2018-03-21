import path from 'path'
import { request, config } from '../utils'

const { CORS, api } = config
const { projects, fork } = api

// 获取用户 所有的project 下的 所有的 deploy 过的 models
// export function fetchDeployment(payload) {
//   const user_ID = localStorage.getItem('user_ID')
//   return request(`${CORS}/served_models/${user_ID}?privacy=all`);
// }
const PREFIX = 'project'

// 获取用户所有 projects
export function getProjects({ filter, onJson }) {
  let params = ''
  for (let key in filter) {
    if (!filter.hasOwnProperty(key)) {
      continue
    }
    if (filter[key]) {
      const value = filter[key]
      if (key === 'projectType') {
        key = 'type'
      }
      params += `&${key}=${value}`
    }
  }
  return request(path.join(CORS, PREFIX) + `?${params}`, undefined, { onJson })
}

export function countProjects({user_ID}){
   return request(path.join(CORS, PREFIX) + `/count?user_ID=${user_ID}`)
}

// 获取用户所有 projects
export function getMyProjects({ filter }) {
  let params = ''
  for (let key in filter) {
    if (!filter.hasOwnProperty(key)) {
      continue
    }
    if (filter[key]) {
      const value = filter[key]
      if (key === 'projectType') {
        key = 'type'
      }
      params += `&${key}=${value}`
    }
  }
  params += `&group=my`
  return request(path.join(CORS, PREFIX) + `?${params}`)
}

/////////////////////////////////////////////////////////////////////////////////////////////////
// 获取用户所有 projects
export function fetchProjects(payload) {
  const user_ID = localStorage.getItem('user_ID')
  if (payload.others) {
    return request(`${CORS}${projects}?user_ID=${user_ID}&others=true`)
  } else {
    return request(`${CORS}${projects}?user_ID=${user_ID}&privacy=${payload.privacy}`)
  }
}

// 获取单个 project
export function fetchProject({ projectId, onJson }) {
  return request(`${CORS}${projects}/${projectId}`, undefined, { onJson })
}

// 新建 project
export function createProject({ body, onJson }) {
  return request(`${CORS}${projects}`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(body),
  }, { onJson })
}

// 更新 project
export function updateProject({ body, projectId, onJson }) {
  return request(`${CORS}${projects}/${projectId}`, {
    method: 'put',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  }, { onJson })
}

// 删除 project
export function deleteProject({projectId}) {
  const user_ID = localStorage.getItem('user_ID')
  return request(`${CORS}${projects}/${projectId}?user_ID=${user_ID}`, {
    method: 'delete',
  })
}

// fork project
export function forkProject(prjID) {
  const user_ID = localStorage.getItem('user_ID')
  return request(`${CORS}${fork}/${prjID}?user_ID=${user_ID}`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
  })
}
