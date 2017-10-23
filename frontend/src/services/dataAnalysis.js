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

// 添加section
export function addSection(section) {
  return {
    data: {
      sectionId: '000001',
      section_name: 'new_section____xddd',
      section_type: 'K-mean',
      steps: [
        {
          title: '选择目标数据表',
          content: null,
        },

        {
          title: '选择来源数据表',
          content: '59c21d71d845c0538f0faeb2',
        },

        {
          title: '编辑对应列名称',
          content: 'A',
        },

      ],
    },
    header: {},
  }

  // return request('/api/section', {
  //   method: 'ADD',
  // });
}

// 删除section

// 更改section
export function updateSection(sectionId, section) {
  console.log('sectionId', sectionId)
  console.log('upload_section', section)
  // return request(`/api${PREFIX}/section`, {
  //   method: 'ADD',
  //   body: section
  // });
}

//
export async function fetchToolkits(payload) {
  return await request(`${CORS}${toolkits}`)
}


