import * as path from 'path'
import request from './request'

// 获取用户 所有的project 下的 所有的 deploy 过的 models
// export function fetchDeployment(payload) {
//   const user_ID = localStorage.getItem('user_ID')
//   return request(`${CORS}/served_models/${user_ID}?privacy=all`);
// }
const PREFIX = 'project'

// 获取用户所有 projects
export function getProjects({filter, onJson}) {
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
    return request(path.join('pyapi', PREFIX) + `?${params}`, undefined, {onJson})
}

// 获取用户所有 projects
export function getMyProjects({filter}) {
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
    return request(path.join('/pyapi', PREFIX) + `?${params}`)
}

// 获取单个 project
// export function fetchProject({ projectId, onJson }) {
//   return request(path.join('/pyapi', PREFIX, 'projects', projectId), undefined, { onJson })
// }

export function getProject({projectId, projectType, version, onJson}) {
    if (version) {
        version = version.split('.').join('_');
        return request(`pyapi/${projectType}s/${projectId}?version=${version}&yml=true`, undefined, {onJson})
    } else {
        return request(`pyapi/${projectType}s/${projectId}?yml=true`, undefined, {onJson})
    }
}

export function testModule({projectId, onJson}) {
  return request(path.join('/pyapi', 'modules', 'test', projectId), undefined, {onJson})
}

export function deploy({projectId, projectType, filePath, commitMsg, onJson}) {
    return request(path.join('/pyapi', `${projectType}s`, 'deploy', projectId), {
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            file_path: filePath,
            commit_msg: commitMsg
        }),
    }, {onJson})
}

export function publish({projectId, projectType, filePath, version, commitMsg, onJson}) {
    version = version.split('.').join('_');
    return request(path.join('/pyapi', `${projectType}s`, 'publish', projectId, version), {
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            file_path: filePath,
            commit_msg: commitMsg
        }),
    }, {onJson})
}

export function getContents({hubUserName, hubToken, onJson}) {
    return request(`/hub_api/user/${hubUserName}/api/contents/?content=1&${(new Date()).getTime()}`, {
        method: 'get',
        headers: {
            'Authorization': `token ${hubToken}`,
        },
    }, {onJson})
}