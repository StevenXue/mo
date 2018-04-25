// import request from './request'
import {request} from '@jupyterlab/services'
import {message} from 'antd'
import * as path from 'path'

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
    return request(path.join('/pyapi', PREFIX) + `?${params}`, undefined, {onJson})
}

const prefix = 'modules'

export function getModules(onSuccess) {
    return request(`pyapi/${prefix}/module_list`, null, {onSuccess})
}

export function getModule({moduleId, version, onJson}) {
    if (version) {
        version = version.split('.').join('_');
        return request(`pyapi/${prefix}/${moduleId}?version=${version}&yml=true`, undefined, {onJson})
    } else {
        return request(`pyapi/${prefix}/${moduleId}?yml=true`, undefined, {onJson})
    }
}

export function getApp({appId, version, onJson}) {
    return request(`pyapi/apps/${appId}?used_modules=true`, undefined, {onJson})
}

export function addModuleToApp({appId, moduleId, func, version, onJson}) {
    if (version) {
        version = version.split('.').join('_');
    }
    return request(`pyapi/apps/add_used_module/${appId}`, {
        method: 'put',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            used_module: moduleId,
            func,
            version
        }),
    }, {onJson})
}

export function removeModuleInApp({appId, moduleId, version, onJson}) {
    version = version.split('.').join('_');
    return request(`pyapi/apps/remove_used_module/${appId}`, {
        method: 'put',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            used_module: moduleId,
            version
        }),
    }, {onJson})
}

// 新建 module
export function createModule(payload) {
    return request(`${prefix}`, {
        method: 'POST',
        body: {
            user_ID: payload.user_ID,
            name: payload.name,
            description: payload.description,
        },
    })
}

export function fetchModuleList(payload) {
    return request(`${prefix}/module_list`)
}

export function fetchModule(payload) {
    return request(`${prefix}/${payload.moduleId}`)
}

export function updateModule(payload) {
    return request(`${prefix}/update_module`, {
        method: 'POST',
        body: {
            ...payload,
        },
    })
}
