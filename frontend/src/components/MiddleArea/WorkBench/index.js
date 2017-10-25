import React from 'react';
import styles from './index.less';
import {connect} from 'dva';

import {Select, Collapse, Button, Input} from 'antd';
import ToolBar from '../ToolBar/index';

const Option = Select.Option;
const Panel = Collapse.Panel;


const JsonToArray = (json, key) => {
  let arr = [];
  for (let prop in json) {
    let newObject = json[prop];
    newObject[[key]] = prop;
    arr.push(newObject);
  }
  return arr
};


function WorkBench({section, model, dispatch, namespace}) {
  //state
  const {
    stagingDataList,
    sectionsJson,

  } = model;
  //change state
  // const setSections = (sectionsJson) => {
  //   dispatch({
  //     type: namespace + '/setSections',
  //     sectionsJson: sectionsJson
  //   })
  // };


  function handleBlur() {
    console.log('blur');
  }

  function handleFocus() {
    console.log('focus');
  }

  const {
    _id: sectionId,
    steps,
    active_steps

  } = section;

  //functions 下拉框选择
  function handleChange(value, index, argIndex) {
    // section.steps[index].args[argIndex].values = [value]; 备选方案以后再加相应的reducer

    sectionsJson[section._id].steps[index].args[argIndex].values = [value];

    dispatch({
      type: namespace + '/setSections',
      payload: {sectionsJson: sectionsJson}
    });
    // 将预览设置
  }

  function handleSave(stagingDatasetId, stepIndex, argIndex) {

    dispatch({
      type: namespace + '/getFields',
      payload: {
        stagingDatasetId,
        sectionId: section._id,
        stepIndex,
        argIndex
      }
    });

    // let activeKey=active_steps;


    dispatch({
      type: namespace + '/setActiveKey',
      payload: {
        activeKey: ["1", "2"],
        sectionId: section._id
      }
    })
  }

  function callback(key) {
    dispatch({
      type: namespace + '/setActiveKey',
      payload: {
        activeKey: key,
        sectionId: section._id
      }
    });
  }


  function handleClickField(fieldName) {
    dispatch({
      type: namespace + '/addRemoveField',
      payload: {
        fieldName,
        sectionId: section._id
      }
    })
  }

  function handleOnChangeArgs(e, stepIndex, argIndex) {
    dispatch({
      type: namespace + '/setParameter',
      payload: {
        sectionId: section._id,
        stepIndex,
        argIndex,
        value: e
      }
    });
  }


  return (
    <div className={styles.normal}>
      <ToolBar sectionId={sectionId} {...{model, dispatch, namespace}}/>
      <div className={styles.container}>
        <Collapse className={styles.collapse}
                  defaultActiveKey={['data_source']} onChange={callback}
                  activeKey={active_steps}
        >
          {
            steps.map((step, stepIndex) => {
                switch (step.name) {
                  case 'data_source':
                    return <Panel
                      className={styles.panel}
                      header={step.display_name} key={"1"}>
                      {
                        step.args.map((arg, argIndex) =>
                          <div key={arg.name + argIndex}>
                            <Select
                              key={arg.name + argIndex}
                              className={styles.select}
                              showSearch
                              style={{width: 200}}
                              placeholder="Select a stagingData"
                              optionFilterProp="children"
                              onChange={(value) => handleChange(value, stepIndex, argIndex)}
                              onFocus={handleFocus}
                              onBlur={handleBlur}
                              defaultValue={arg.values[0]}
                              filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                            >
                              {stagingDataList.map((stagingData) =>
                                <Option key={stagingData._id} value={stagingData._id}>{stagingData.name}</Option>
                              )}
                            </Select>

                            <Button type="primary"
                                    onClick={() => handleSave(arg.values[0], stepIndex, argIndex)}
                                    className={styles.button}>
                              next
                            </Button>

                          </div>
                        )
                      }

                    </Panel>;
                  case 'fields':
                    return <Panel header="Select Fields" key={"2"}
                                  className={styles.panel}
                    >
                      <div className={styles.fields}>

                        {step.args[0]["fields"] && step.args[0].fields.map(field =>
                          <div
                            key={field[0]}
                            className={styles.field}
                            onClick={() => handleClickField(field[0])}
                            style={{backgroundColor: (step.args[0].values).includes(field[0]) ? 'yellow' : '#F3F3F3'}}
                          >
                            <p className={styles.text}>{field[0]}</p>
                          </div>
                        )}
                      </div>

                      <div className={styles.end_button}>
                        <Button type="primary" className={styles.button}>next</Button>
                      </div>
                    </Panel>;
                  case 'parameters':
                    return (
                      <Panel header="Parameter" key={"3"}
                             className={styles.panel}>
                        {
                          step.args.map((arg, argIndex) =>
                            <div className={styles.pair} key={arg.name + argIndex}>
                            <span>
                              {arg.display_name}
                            </span>
                              <div className={styles.row}>
                                <Input placeholder="" defaultValue={arg.value}
                                       onChange={(e) => handleOnChangeArgs(e.target.value, stepIndex, argIndex)}/>
                              </div>
                            </div>
                          )
                        }
                        <div className={styles.end_button}>
                          <Button type="primary" className={styles.button}>run</Button>
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
