import { request, config } from '../utils'

const { CORS, api } = config;
const { projectJobs, toolkits } = api;
const PREFIX = '/sections';

// 获取用户所有sections
export async function fetchSections(payload) {

  let res = await request(`${CORS}/project/jobs/${payload.projectId}?categories=${payload.categories}`);
  if(payload.categories==='toolkit') {
  }
  // let res = await request(`${CORS}${projectJobs}/${payload.projectId}?categories=${payload.categories}`);
  return res
}

const myDict = {
  'dataAnalysis': 'toolkit'
};

// 添加section
export function addSection(payload) {
  return request('/api/job/job', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      "project_id": payload.project_id,
      "job_type": myDict[payload.namespace],
      "algorithm_id": payload.algorithm_id,
    })
  });
}

// 删除section

// 更改section
export function saveSection(payload) {

  // console.log('sectionId', sectionId);
  console.log('upload_section', payload.section);
  return request(`/api/job/job_steps`, {
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


