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
  function handleChange(value, index, argIndex) {

    sectionsJson[section._id].toolkit.steps[index].args[argIndex].values = [value];
    setSections(sectionsJson);
    console.log(`selected ${value}`);
    // 将预览设置
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
      steps
    }

  } = section;


  // const steps = JsonToArray(stepsJson, 'key');


  return (
    <div className={styles.normal}>
      <ToolBar sectionId={sectionId}/>
      <div className={styles.container}>
        <Collapse className={styles.collapse} defaultActiveKey={['1']} onChange={callback}>

          {
            steps.map((step, index) => {
                switch (step.name) {
                  case 'data_source':
                    return <Panel
                      className={styles.panel}
                      header={step.display_name} key="1">
                      {
                        step.args.map((arg, argIndex)=>
                          <Select
                            key={arg.name+argIndex}
                            className={styles.select}
                            showSearch
                            style={{width: 200}}
                            placeholder="Select a stagingData"
                            optionFilterProp="children"
                            onChange={(value) => handleChange(value, index, argIndex)}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            defaultValue={arg.values[0]}
                            filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                          >
                            {stagingDataList.map((stagingData) =>
                              <Option key={stagingData._id} value={stagingData._id}>{stagingData.name}</Option>
                            )}
                          </Select>
                        )
                      }
                      <Button type="primary" className={styles.button}>save</Button>
                    </Panel>;
                  case 'fields':
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
                  case 'parameters':
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
