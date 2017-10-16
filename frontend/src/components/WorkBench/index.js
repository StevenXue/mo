import React from 'react';
import styles from './WorkBench.css';
import {connect} from 'dva';

import {Select} from 'antd';
import ToolBar from '../../components/ToolBar';
const Option = Select.Option;

function WorkBench({section, dataAnalysis, dispatch}) {
  //state
  const {
    stagingDataList,
    sectionsJson
  } = dataAnalysis;
  //change state

  const setSections = (sectionsJson) => {
    dispatch({
      type: 'dataAnalysis/setSections',
      sectionsJson: sectionsJson
    })
  };

  //functions
  function handleChange(value, step) {
    sectionsJson[section.section_id].steps[step].content = value;
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
      <ToolBar section_id={section.section_id}/>

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
