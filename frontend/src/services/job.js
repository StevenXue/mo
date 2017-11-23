
import request from '../utils/request';

const PREFIX = "/job";

// 保存
export function save_result(payload) {
  return request(`/api${PREFIX}/save_result`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body:  JSON.stringify({
      "job_id": payload.id
    })
  })
}


// 另存为
export function save_as_result(payload) {
  return request(`/api${PREFIX}/save_as_result`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body:  JSON.stringify({
      "job_id": payload.id,
      'new_sds_name': payload.newSdsName
    })
  })
}

export function update(payload) {
  const jobId = payload.sectionId
  delete payload.sectionId
  return request(`/api${PREFIX}/jobs/${jobId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body:  JSON.stringify(payload)
  })
}

export function jobToCode(payload) {
  return request(`/api/job/to_code`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      "section_id": payload.sectionId,
      "project_id": payload.projectId
    })
  });
}

