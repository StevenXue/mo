import React from 'react';
import styles from './index.less';
import {connect} from 'dva';

import {Select, Collapse, Button, Input} from 'antd';
import ToolBar from '../ToolBar/index';

const Option = Select.Option;
const Panel = Collapse.Panel;

function callback(key) {
  console.log(key);
}

const JsonToArray = (json, key) => {
  let arr = [];
  for (let prop in json) {
    let newObject = json[prop];
    newObject[[key]] = prop;
    arr.push(newObject);
  }
  return arr
};

const fields = ['aaa', 'aaa', 'aaa', 'aaa', 'aaa', 'aaa', 'aaa', 'aaa', 'aaa', 'aaa'];

const toolkit = {
  "_id": "5980149d8be34d34da32c170",
  "name": "K平均数算法",
  "description": "计算所选数据集合的k-mean, 把一个把数据空间划分为k个子集",
  "category": 0,
  "target_py_code": "def k_mean(arr0, index, n_clusters=2):\n    matrix = np.array(arr0)\n    k_means = KMeans(n_clusters).fit(matrix)\n    result = k_means.labels_\n    label = data_utility.retrieve_nan_index(result.tolist(), index)\n    # return {\"Number of Clusters\": n_clusters,\n    #         \"Centroids of Clusters\": k_means.cluster_centers_.tolist(),\n    #         \"SSE(Sum of Squared Errors)\": k_means.inertia_}, {\"Clustering Labels\": label}\n    return label, n_clusters, k_means.cluster_centers_.tolist(), k_means.inertia_\n",
  "fields": [],
  "tags": [],
  "entry_function": "k_mean",
  "parameter_spec": {
    'data_source': {
      'name': 'data_source',
      'type': {
        "key": "select_box",
        "des": 'select data source',
        'range': 1,
      },
      'default': null,
      "required": true,
    },

    "data": {
      "name": "input",
      "type": {
        "key": "select_box",
        "des": "nD tensor with shape: (batch_size, ..., input_dim). The most common situation would be a 2D input with shape (batch_size, input_dim).",
        "range": null
      },
      "default": null,
      "required": true,
      "len_range": [
        1,
        null
      ],
      "data_type": [
        "int",
        "float"
      ]
    },
    "args": [
      {
        "name": "k",
        "type": {
          "key": "int",
          "des": "the number of clustering numbers",
          "range": [
            2,
            null
          ]
        },
        "default": 2,
        "required": true
      }
    ]
  },
  "result_spec": {
    "if_reserved": true,
    "args": [
      {
        "name": "Clustering_Label",
        "des": "原始数据的每一行元素，对应分类的分类标签",
        "if_add_column": true,
        "attribute": "label",
        "usage": [
          "pie",
          "scatter"
        ]
      },
      {
        "name": "Number of Clusters",
        "des": "聚类的数量",
        "if_add_column": false,
        "attribute": "general_info"
      },
      {
        "name": "Centroids of Clusters",
        "des": "每个类的中心点",
        "if_add_column": false,
        "attribute": "position",
        "usage": [
          "scatter"
        ]
      },
      {
        "name": "SSE",
        "des": "每个到其中心点的距离之和",
        "if_add_column": false,
        "attribute": "general_info"
      }
    ]
  }
};

const conf = {
  'steps': [
    {
      type: 'select_data',
      value: null,
    },

    {
      type: 'select_field',
      value: null
    }

  ]
};


function Data() {
  return <div>
    data
  </div>
}


function Args() {
  return <div>
    Args
  </div>
}


function WorkBench({section, model, dispatch, namespace}) {


  //state
  const {
    stagingDataList,
    sectionsJson
  } = model;
  //change state
  const setSections = (sectionsJson) => {
    dispatch({
      type: namespace + '/setSections',
      sectionsJson: sectionsJson
    })
  };

  //functions
  function handleChange(value, step) {
    sectionsJson[section._id].toolkit.parameter_spec.data_source.value = value;
    setSections(sectionsJson);
    console.log(`selected ${value}`);
  }

  function handleBlur() {
    console.log('blur');
  }

  function handleFocus() {
    console.log('focus');
  }

  const {
    _id: sectionId,
    toolkit: {
      parameter_spec: stepsJson
    }

  } = section;


  const steps = JsonToArray(stepsJson, 'key');


  return (
    <div className={styles.normal}>
      <ToolBar sectionId={sectionId}/>
      <div className={styles.container}>
        <Collapse className={styles.collapse} defaultActiveKey={['1']} onChange={callback}>

          {
            steps.map((step, index) => {
                switch (step.key) {
                  case 'data_source':
                    return <Panel
                      // style={{borderWidth: 1}}
                      className={styles.panel}
                      header="Select Data" key="1">
                      <Select
                        className={styles.select}
                        showSearch
                        style={{width: 200}}
                        placeholder="Select a stagingData"
                        optionFilterProp="children"
                        onChange={(value) => handleChange(value, 0)}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        defaultValue={step.value}
                        filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                      >
                        {stagingDataList.map((stagingData) =>
                          <Option key={stagingData._id} value={stagingData._id}>{stagingData.name}</Option>
                        )}
                      </Select>

                      <Button type="primary" className={styles.button}>save</Button>
                    </Panel>;
                  // return <Panel
                  //   // style={{borderWidth: 1}}
                  //   className={styles.panel}
                  //   header="Select Data" key="1">
                  //   <DataSource
                  //     key={step.key + index}
                  //     step={step}
                  //     {...{model, dispatch, namespace}}
                  //   />
                  // </Panel>;
                  case 'data':
                    return <Panel header="Select Fields" key="2"
                                  className={styles.panel}
                    >
                      <div className={styles.fields}>
                        {fields.map(field =>
                          <div key={Math.random()} className={styles.field}>field</div>
                        )}
                      </div>

                      <div className={styles.end_button}>
                        <Button type="primary" className={styles.button}>save</Button>
                      </div>
                    </Panel>;
                  case 'args':
                    return (
                      <Panel header="Parameter" key="3"
                             className={styles.panel}>
                      <span>
                        Number of cluster
                      </span>
                        <div className={styles.row}>
                          <Input placeholder=""/>
                          <Button type="primary" className={styles.button}>save</Button>
                        </div>
                      </Panel>
                    );
                }
              }
            )
          }
        </Collapse>
      </div>
    </div>
  );
}


// function DataSource({step, model, dispatch, namespace}) {
//
//   const {
//     stagingDataList,
//   } = model;
//
//   //functions
//   function handleChange(value, step) {
//     sectionsJson[section.sectionId].toolkit.parameter_spec.data_source.value = value;
//     setSections(sectionsJson);
//     console.log(`selected ${value}`);
//   }
//
//   function handleBlur() {
//     console.log('blur');
//   }
//
//   function handleFocus() {
//     console.log('focus');
//   }
//
//   return <div>
//     <Select
//       className={styles.select}
//       showSearch
//       style={{width: 200}}
//       placeholder="Select a stagingData"
//       optionFilterProp="children"
//       onChange={(value) => handleChange(value, 0)}
//       onFocus={handleFocus}
//       onBlur={handleBlur}
//       defaultValue={step.value}
//       filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
//     >
//       {stagingDataList.map((stagingData) =>
//         <Option key={stagingData._id} value={stagingData._id}>{stagingData.name}</Option>
//       )}
//     </Select>
//     <Button type="primary" className={styles.button}>save</Button>
//   </div>
// }
export default WorkBench;
