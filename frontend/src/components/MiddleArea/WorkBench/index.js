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



function Data(){
  return <div>
    data
  </div>
}




function Args(){
  return <div>
    Args
  </div>
}


function WorkBench({section, model, dispatch, namespace}) {
  function DataSource({step,model, dispatch, namespace}){

    const {
      stagingDataList,
    } = model;

    //functions
    function handleChange(value, step) {
      sectionsJson[section.sectionId].steps[step].content = value;
      setSections(sectionsJson);
      console.log(`selected ${value}`);
    }

    function handleBlur() {
      console.log('blur');
    }

    function handleFocus() {
      console.log('focus');
    }


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
    </Panel>
  }

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
    sectionsJson[section.sectionId].steps[step].content = value;
    setSections(sectionsJson);
    console.log(`selected ${value}`);
  }

  function handleBlur() {
    console.log('blur');
  }

  function handleFocus() {
    console.log('focus');
  }

  // mock data
  section = {
    "_id": "59c21e90d845c0538f0faf8b",
    "create_time": "2017-09-20 07:53:52.484000",
    "fields": {
      "source": [
        "Theta"
      ],
      "target": null
    },
    "params": {},
    "project": "59c21ca6d845c0538f0fadd5",
    "results": {
      "fields": {
        "source": [
          "Theta"
        ],
        "target": null
      },
      "result": [
        [
          -0.7297837367412536
        ],
        [
          0.011755769467039672
        ],
        [
          -0.5194903514608048
        ],
        [
          -0.04592403874729975
        ],
        [
          -0.7880148107282653
        ],
        [
          -0.8316518487334799
        ],
        [
          1.0855344526684922
        ],
        [
          -0.8269805966597833
        ],
        [
          0.020692077781937327
        ],
        [
          -0.40517523860139976
        ],
        [
          1.0220518468470765
        ],
        [
          -0.07870984522728142
        ],
        [
          -0.7614379976878554
        ],
        [
          0.03624357536890208
        ],
        [
          2.0425318340275322
        ],
        [
          -0.28584070581187354
        ],
        [
          2.187195578371947
        ],
        [
          -0.1802878173391538
        ],
        [
          -0.6144821482886456
        ],
        [
          -0.6295694220670441
        ],
        [
          0.31535814026927694
        ],
        [
          0.7536434435317575
        ],
        [
          -0.6422195208504707
        ],
        [
          0.8885875018843192
        ],
        [
          -0.6132635607911595
        ],
        [
          -0.6464845770916718
        ],
        [
          1.0318585748030356
        ],
        [
          -0.6957793427637858
        ],
        [
          -0.1757906491936696
        ],
        [
          -0.46044688580880244
        ],
        [
          -0.07012170476880834
        ],
        [
          0.5302357356593161
        ],
        [
          -0.465350249786782
        ],
        [
          0.05353591223798976
        ],
        [
          -0.38707051006732135
        ],
        [
          -0.08668869193701147
        ],
        [
          -0.7475693114069427
        ],
        [
          0.47017678042607536
        ],
        [
          -0.8262262329708634
        ],
        [
          -0.608592308717463
        ],
        [
          0.8356369737197471
        ],
        [
          -0.4229898272551243
        ],
        [
          -0.5337652335742128
        ],
        [
          -0.7383428632116913
        ],
        [
          -0.7201220787254714
        ],
        [
          0.9532886952032211
        ],
        [
          0.3880671942859443
        ],
        [
          0.2459566808886432
        ],
        [
          2.2984932364756725
        ],
        [
          -0.33809489826359657
        ],
        [
          0.4396540650128535
        ],
        [
          -0.7004796088255177
        ],
        [
          -0.5313860865553115
        ],
        [
          -0.8185375261414871
        ],
        [
          -0.7890303003095036
        ],
        [
          -0.15020031174646267
        ],
        [
          -0.6772103904211414
        ],
        [
          1.0421005125795255
        ],
        [
          0.6335835610413468
        ],
        [
          -0.7827922928818966
        ],
        [
          0.23057926722989075
        ],
        [
          -0.531502142507453
        ],
        [
          -0.588166461140554
        ],
        [
          -0.6264939393352936
        ],
        [
          -0.484412439926028
        ],
        [
          -0.050392192904748584
        ],
        [
          -0.5246548413311029
        ],
        [
          -0.8527450180352025
        ],
        [
          0.48337814498217413
        ],
        [
          -0.37209929224106425
        ],
        [
          -0.6383606604417649
        ],
        [
          0.35182872322975217
        ],
        [
          -0.2218938761818916
        ],
        [
          0.9421763377856698
        ],
        [
          -0.7870573491230977
        ],
        [
          -0.7764962574782186
        ],
        [
          -0.15875943821690036
        ],
        [
          -0.21765783392872584
        ],
        [
          -0.543426891589995
        ],
        [
          -0.6677808443096422
        ],
        [
          -0.8092530499701649
        ],
        [
          -0.029008883722672046
        ],
        [
          0.5784859977621564
        ],
        [
          -0.2401726886441823
        ],
        [
          0.20057880360130576
        ],
        [
          -0.7080232457147171
        ],
        [
          -0.0819594118872442
        ],
        [
          -0.47887076821127
        ],
        [
          0.3581827866095008
        ],
        [
          0.7334206938710963
        ],
        [
          -0.5104379871937657
        ],
        [
          -0.11680521151773798
        ],
        [
          -0.28938041235219014
        ],
        [
          0.05472548574744042
        ],
        [
          -0.04160095453002784
        ],
        [
          0.08452285145977774
        ],
        [
          0.14318913526732016
        ],
        [
          -0.025266079266107765
        ],
        [
          0.1811974595936706
        ],
        [
          -0.5834081671027513
        ],
        [
          0.45453824087500444
        ],
        [
          -0.32190509293985337
        ],
        [
          -0.09083769222607109
        ],
        [
          -0.47077586554939843
        ],
        [
          -0.7378786394031251
        ],
        [
          -0.6435831782881337
        ],
        [
          0.8842354036790119
        ],
        [
          2.203878621492292
        ],
        [
          0.7636242554159289
        ],
        [
          -0.45432493433333687
        ],
        [
          -0.5280494779312426
        ],
        [
          0.795829782135203
        ],
        [
          -0.12623475762923714
        ],
        [
          -0.8113420571087124
        ],
        [
          0.12517144869734792
        ],
        [
          0.04677565302574575
        ],
        [
          -0.6961275106202105
        ],
        [
          -0.5460671645012147
        ],
        [
          0.15029756233598873
        ],
        [
          0.5457872332462809
        ],
        [
          -0.49334874824092567
        ],
        [
          0.04996719170963777
        ],
        [
          2.4115317338615205
        ],
        [
          0.2458406249365017
        ],
        [
          -0.4921301607434396
        ],
        [
          -0.677558558277566
        ],
        [
          -0.6730323761440464
        ],
        [
          -0.6750923692945585
        ],
        [
          -0.4215391278533552
        ],
        [
          -0.7162342043287302
        ],
        [
          1.9856063895021128
        ],
        [
          -0.6229252188069416
        ],
        [
          1.4130443496118843
        ],
        [
          -0.30661472124520706
        ],
        [
          -0.043225737860009224
        ],
        [
          -0.47800034857020857
        ],
        [
          1.2302562249889777
        ],
        [
          -0.2863049296204397
        ],
        [
          -0.7094739451164862
        ],
        [
          -0.70140805644265
        ],
        [
          4.481360626317637
        ],
        [
          -0.6665332428241209
        ],
        [
          0.8666819409176059
        ],
        [
          -0.6107393438320813
        ],
        [
          -0.7583044869800342
        ],
        [
          -0.2827071951040523
        ],
        [
          -0.49978985358478045
        ],
        [
          0.016688147433054613
        ],
        [
          -0.07931913897602444
        ],
        [
          3.748467288543888
        ],
        [
          -0.39423696511206074
        ],
        [
          -0.5840754888275652
        ],
        [
          -0.12945531030116456
        ],
        [
          -0.7408670801707695
        ],
        [
          -0.17280220842602526
        ],
        [
          -0.600323322127379
        ],
        [
          -0.5522761579407865
        ],
        [
          -0.43099768795288973
        ],
        [
          -0.47434458607775043
        ],
        [
          -0.41277690346666984
        ],
        [
          -0.5074785604141567
        ],
        [
          3.5259590143005433
        ],
        [
          2.5126744961528624
        ],
        [
          -0.7385459611279389
        ],
        [
          -0.8822812578552214
        ],
        [
          -0.4400790662079643
        ],
        [
          -0.8236439880357144
        ],
        [
          -0.5362314225572202
        ],
        [
          2.701526544275164
        ],
        [
          0.2458406249365017
        ],
        [
          1.1635240525075992
        ],
        [
          -0.6885548597429758
        ],
        [
          6.869327897581718
        ],
        [
          -0.21197109227379096
        ],
        [
          0.354323926200795
        ],
        [
          0.015759699815922387
        ],
        [
          0.09789829994408884
        ],
        [
          -0.5647521727960008
        ],
        [
          -0.5534947454382726
        ],
        [
          -0.8403850591321298
        ],
        [
          -0.4911436851502366
        ],
        [
          -0.5241325895464659
        ],
        [
          -0.6069094974114108
        ],
        [
          0.9906296978047577
        ],
        [
          -0.8725035438872977
        ],
        [
          0.33584201582225665
        ],
        [
          0.1571448635123389
        ],
        [
          -0.6689994318071283
        ],
        [
          -0.41002057460330854
        ],
        [
          0.7829475714474934
        ],
        [
          0.16976594830773006
        ],
        [
          -0.45301930487174463
        ],
        [
          -0.7338456950662071
        ],
        [
          0.03221063103198398
        ],
        [
          2.963145674390203
        ],
        [
          -0.8224254005382283
        ],
        [
          0.0048214263265833725
        ],
        [
          -0.30504796589129646
        ],
        [
          -0.49851323811122367
        ],
        [
          -0.7523566194327808
        ],
        [
          -0.17486220157653737
        ],
        [
          -0.5167920505735143
        ],
        [
          -0.5641718930352931
        ],
        [
          -0.5425274579608982
        ],
        [
          0.38475959964991074
        ],
        [
          -0.4262393939150871
        ],
        [
          -0.26698161358887523
        ],
        [
          0.6588837586081999
        ],
        [
          0.06389390596662113
        ],
        [
          0.2661504165612691
        ],
        [
          -0.7813706074681628
        ],
        [
          -0.813895288055826
        ],
        [
          -0.6418713529940461
        ],
        [
          1.9763799413068612
        ],
        [
          1.0597410173050377
        ],
        [
          -0.3305802753624326
        ]
      ]
    },
    "results_staging_data_set_id": "59c21e92d845c0538f0faf8c",
    "run_args": {},
    "staging_data_set": "data_1",
    "staging_data_set_id": "59c21d71d845c0538f0faeb2",
    "status": 200,
    "toolkit": toolkit,
    "updated_time": "2017-09-20 07:53:54.251000"
  };

  const {
    _id: sectionId,
    toolkit: {
      parameter_spec: stepsJson
    }

  } = section;

  const JsonToArray = (json) => {
    let arr = [];
    for (let prop in json) {
      let newObject = json[prop];
      newObject['key'] = prop;
      arr.push(newObject);
    }
    return arr
  };

  const steps = JsonToArray(stepsJson);


  return (
    <div className={styles.normal}>
      <ToolBar sectionId={sectionId}/>

      <div className={styles.container}>
        <Collapse className={styles.collapse} defaultActiveKey={['1']} onChange={callback}>

          {
            steps.map((step,index)=>{
              switch(step.key){
                case 'data_source':
                  // return <Panel
                  //   // style={{borderWidth: 1}}
                  //   className={styles.panel}
                  //   header="Select Data" key="1">
                  //
                  //   <Select
                  //     className={styles.select}
                  //     showSearch
                  //     style={{width: 200}}
                  //     placeholder="Select a stagingData"
                  //     optionFilterProp="children"
                  //     onChange={(value) => handleChange(value, 0)}
                  //     onFocus={handleFocus}
                  //     onBlur={handleBlur}
                  //     defaultValue={step.value}
                  //     filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                  //   >
                  //     {stagingDataList.map((stagingData) =>
                  //       <Option key={stagingData._id} value={stagingData._id}>{stagingData.name}</Option>
                  //     )}
                  //   </Select>
                  //
                  //   <Button type="primary" className={styles.button}>save</Button>
                  // </Panel>
                  return <DataSource
                    key={step.key+index}
                    step={step}
                    {...{model, dispatch, namespace}}
                  />;
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
                  </Panel>
                  // return <Data key={step.key+index}/>;
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
                  // return <Args key={step.key+index}/>;
              }
            }
            )
          }
        </Collapse>
      </div>
    </div>
  );

//
// return (
//   <div className={styles.normal}>
//     <ToolBar sectionId={sectionId}/>
//
//     <div className={styles.container}>
//       <Collapse className={styles.collapse} defaultActiveKey={['1']} onChange={callback}>
//
//         {
//           steps.map((step,index)=>
//             <Panel
//               // style={{borderWidth: 1}}
//               className={styles.panel}
//               header="Select Data" key="1">
//
//               <Select
//                 className={styles.select}
//                 showSearch
//                 style={{width: 200}}
//                 placeholder="Select a stagingData"
//                 optionFilterProp="children"
//                 onChange={(value) => handleChange(value, 0)}
//                 onFocus={handleFocus}
//                 onBlur={handleBlur}
//                 defaultValue={section.steps[0].content}
//                 filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
//               >
//                 {stagingDataList.map((stagingData) =>
//                   <Option key={stagingData._id} value={stagingData._id}>{stagingData.name}</Option>
//                 )}
//               </Select>
//
//               <Button type="primary" className={styles.button}>save</Button>
//             </Panel>
//           )
//         }
//         <Panel
//           // style={{borderWidth: 1}}
//           className={styles.panel}
//           header="Select Data" key="1">
//
//           <Select
//             className={styles.select}
//             showSearch
//             style={{width: 200}}
//             placeholder="Select a stagingData"
//             optionFilterProp="children"
//             onChange={(value) => handleChange(value, 0)}
//             onFocus={handleFocus}
//             onBlur={handleBlur}
//             defaultValue={section.steps[0].content}
//             filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
//           >
//             {stagingDataList.map((stagingData) =>
//               <Option key={stagingData._id} value={stagingData._id}>{stagingData.name}</Option>
//             )}
//           </Select>
//
//           <Button type="primary" className={styles.button}>save</Button>
//         </Panel>
//
//
//         <Panel header="Select Fields" key="2"
//                className={styles.panel}
//         >
//           <div className={styles.fields}>
//             {fields.map(field =>
//               <div key={Math.random()} className={styles.field}>field</div>
//             )}
//           </div>
//
//           <div className={styles.end_button}>
//             <Button type="primary" className={styles.button}>save</Button>
//           </div>
//         </Panel>
//
//         <Panel header="Parameter" key="3"
//                className={styles.panel}>
//
//             <span>
//               Number of cluster
//             </span>
//
//           <div className={styles.row}>
//             <Input placeholder=""/>
//             <Button type="primary" className={styles.button}>save</Button>
//
//           </div>
//
//         </Panel>
//       </Collapse>
//     </div>
//   </div>
// );
}

export default connect(({dataAnalysis}) => ({dataAnalysis}))(WorkBench);
