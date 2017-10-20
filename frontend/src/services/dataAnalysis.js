import { request, config } from '../utils'

const { CORS, api } = config
const { projectJobs, toolkits } = api
const PREFIX = '/sections'

const test_section = {
  section_name: 'new_section_1',
  sectionId: '0001',
  method: {
    // 方法大类 数据处理，建模
    first: 'data_analysis',
    second: '提升数据质量',
    third: '合并添加行',
  },

  steps: [
    {
      title: '选择目标数据表',
      content: '59c21d71d845c0538f0faeb2',
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
}

// 获取用户所有sections
export async function fetchSections(payload) {
  const data = [
    // one section
    {
      ...test_section,
      section_name: 'new_section_1',
      sectionId: '0001',
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
    {
      ...test_section,
      sectionId: '0002',
      section_name: 'new_section_2',
    },
    {
      ...test_section,
      sectionId: '0003',
      section_name: 'new_section_3',
    },

  ];
  let res = await request(`${CORS}/project/jobs/${payload.projectId}?categories=${payload.categories}`);

  console.log("res", res);
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

export async function fetchToolkits(payload) {
  return await request(`${CORS}${toolkits}`)
}


