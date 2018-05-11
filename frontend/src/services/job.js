import request, { org_request } from '../utils/request'

const PREFIX = '/jobs'

export function getJobs(payload) {
  return request(`/pyapi${PREFIX}/project/${payload.projectType}/${payload.projectId}`)
}

export function getTerminals(payload) {
  const { hubUserName, hubToken } = payload
  return request(`/hub_api/user/${hubUserName}/api/terminals?${(new Date()).getTime()}`, {
    method: 'get',
    headers: {
      'Authorization': `token ${hubToken}`,
    },
  })
}

export function getSessions(payload) {
  const { hubUserName, hubToken } = payload
  return request(`/hub_api/user/${hubUserName}/api/sessions?${(new Date()).getTime()}`, {
    method: 'get',
    headers: {
      'Authorization': `token ${hubToken}`,
    },
  })
}

export function deleteSession(payload) {
  const { hubUserName, hubToken, sessionId } = payload
  return request(`/hub_api/user/${hubUserName}/api/sessions/${sessionId}?${(new Date()).getTime()}`, {
    method: 'delete',
    headers: {
      'Authorization': `token ${hubToken}`,
    },
  })
}


export function terminateJob(payload) {
  const { jobId } = payload
  return request(`/pyapi${PREFIX}/${jobId}/terminate`, {
    method: 'put',
  })
}

export function deleteTerminal(payload) {
  const { hubUserName, hubToken, terminalName } = payload
  return request(`/hub_api/user/${hubUserName}/api/terminals/${terminalName}?${(new Date()).getTime()}`, {
    method: 'delete',
    headers: {
      'Authorization': `token ${hubToken}`,
    },
  })
}
