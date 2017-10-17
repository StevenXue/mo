import request from '../utils/request';
const PREFIX = '/sections';


const test_section = {
  section_name: 'new_section_1',
  section_id: '0001',
  method: {
    // 方法大类 数据处理，建模
    first: 'data_analysis',
    second: '提升数据质量',
    third: '合并添加行'
  },

  steps: [
    {
      title: '选择目标数据表',
      content: '59c21d71d845c0538f0faeb2'
    },

    {
      title: '选择来源数据表',
      content: '59c21d71d845c0538f0faeb2'
    },

    {
      title: '编辑对应列名称',
      content: 'A'
    }

  ]
}

// 获取用户所有sections
export function fetchSections() {
  const data = [
    // one section
    {
      ...test_section,
      section_name: 'new_section_1',
      section_id: '0001',
      steps: [
        {
          title: '选择目标数据表',
          content: null
        },

        {
          title: '选择来源数据表',
          content: '59c21d71d845c0538f0faeb2'
        },

        {
          title: '编辑对应列名称',
          content: 'A'
        }

      ]

    },
    {
      ...test_section,
      section_id: '0002',
      section_name: 'new_section_2',
    },
    {
      ...test_section,
      section_id: '0003',
      section_name: 'new_section_3',
    },

  ];
  return {
    data,
    headers: {},
  }

  // return request('/api/users');
}

// 添加section
export function addSection(sectionName) {
  return request('/api/users');
}

// 删除section

// 更改section
export function updateSection(section_id, section) {
  console.log("section_id",section_id);
  console.log("upload_section",section);
  // return request(`/api${PREFIX}/section`, {
  //   method: 'ADD',
  //   body: section
  // });
}
