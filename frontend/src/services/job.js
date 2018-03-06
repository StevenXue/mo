import request, { org_request } from '../utils/request'

const PREFIX = '/job'

// 保存
export function save_result(payload) {
  return request(`/pyapi${PREFIX}/save_result`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      'job_id': payload.id,
    }),
  })
}

// 另存为
export function save_as_result(payload) {
  return request(`/pyapi${PREFIX}/save_as_result`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      'job_id': payload.id,
      'new_sds_name': payload.newSdsName,
    }),
  })
}

export function update(payload) {
  const jobId = payload.sectionId
  delete payload.sectionId
  return request(`/pyapi${PREFIX}/jobs/${jobId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
}

export function jobToCode(payload) {
  return request(`/pyapi/job/to_code`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      'section_id': payload.sectionId,
      'project_id': payload.projectId,
    }),
  })
}

export function getTerminals(payload) {
  const { hubUserName, hubToken } = payload
  return org_request(`/hub_api/user/${hubUserName}/api/terminals?${(new Date()).getTime()}`, {
    method: 'get',
    headers: {
      'Authorization': `token ${hubToken}`,
    },
  })
}

export function getSessions(payload) {
  const { hubUserName, hubToken } = payload
  return org_request(`/hub_api/user/${hubUserName}/api/sessions?${(new Date()).getTime()}`, {
    method: 'get',
    headers: {
      'Authorization': `token ${hubToken}`,
    },
  })
}
