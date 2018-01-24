import {request, config} from '../utils'

const {CORS, api} = config;
const {projectJobs, toolkits} = api;
const PREFIX = '/sections';

// 获取用户所有sections
export async function fetchSections(payload) {

  let res = await request(`${CORS}/project/jobs/${payload.projectId}?categories=${payload.categories}`);
  if (payload.categories === 'toolkit') {
  }
  // let res = await request(`${CORS}${projectJobs}/${payload.projectId}?categories=${payload.categories}`);
  return res
}

const myDict = {
  'dataAnalysis': 'toolkit',
  'modelling': 'model'
};

// 添加section
export function addSection(payload) {
  return request('/pyapi/job/job', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      "project_id": payload.project_id,
      "job_type": myDict[payload.namespace],
      [`${myDict[payload.namespace]}_id`]: payload.algorithm_id
    })
  });
}

// 删除section
export function deleteSection(payload) {
  return request(`/pyapi/job/job`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      "job_id": payload.sectionId
    })
  });
}

// 更改section
export function saveSection(payload) {

  // console.log('sectionId', sectionId);
  console.log('upload_section', payload.section);
  return request(`/pyapi/job/job_steps`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload.section)
  });
}

//
export async function fetchToolkits(payload) {
  return await request(`${CORS}${toolkits}`)
}

export function runToolkits(payload) {
  return request(`/pyapi/toolkit/toolkits/staging_data_set`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload.section)
  });
}

export function runJob(payload) {
  return request(`/pyapi/job/run_job`, {
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
/*
http://122.224.116.44:5005/toolkit/toolkits/staging_data_set

{staging_data_set_id: "59c21d71d845c0538f0faeb2",…}
conf
:
{args: {k: "3"}, data_fields: ["Attention", "Attention_dimension_reduction_PCA_col"]}
project_id
:
"59c21ca6d845c0538f0fadd5"
staging_data_set_id
:
"59c21d71d845c0538f0faeb2"
toolkit_id
:
"5980149d8be34d34da32c170"
 */
