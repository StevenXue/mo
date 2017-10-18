import React from 'react';
import styles from './WorkBench.css';
import {connect} from 'dva';

import {Select, Collapse} from 'antd';
import ToolBar from '../ToolBar/index';

const Option = Select.Option;
const Panel = Collapse.Panel;

function callback(key) {
  console.log(key);
}

const text = `
  A dog is a type of domesticated animal.
  Known for its loyalty and faithfulness,
  it can be found as a welcome guest in many households across the world.
`;

function WorkBench({section, model, dispatch, namespace}) {
  //state
  const {
    stagingDataList,
    sectionsJson
  } = model;
  //change state
  const setSections = (sectionsJson) => {
    dispatch({
      type: namespace + 'dataAnalysis/setSections',
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


  return (
    <div className={styles.normal}>
      <ToolBar sectionId={section.sectionId}/>

      <Collapse defaultActiveKey={['1']} onChange={callback}>
        <Panel header="This is panel header 1" key="1">
          <p>{text}</p>
        </Panel>
        <Panel header="This is panel header 2" key="2">
          <p>{text}</p>
        </Panel>
        <Panel header="This is panel header 3" key="3" disabled>
          <p>{text}</p>
        </Panel>
      </Collapse>


      <div>
        1. 选择目标数据表
      </div>

      <Select
        showSearch
        style={{width: 200}}
        placeholder="Select a stagingData"
        optionFilterProp="children"
        onChange={(value) => handleChange(value, 0)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        defaultValue={section.steps[0].content}
        filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
      >
        {stagingDataList.map((stagingData) =>
          <Option key={stagingData._id} value={stagingData._id}>{stagingData.name}</Option>
        )}
      </Select>


    </div>
  );
}

export default connect(({dataAnalysis}) => ({dataAnalysis}))(WorkBench);
