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

      <div className={styles.container}>
        <Collapse className={styles.collapse} defaultActiveKey={['2']} onChange={callback}>

          <Panel
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
              defaultValue={section.steps[0].content}
              filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
            >
              {stagingDataList.map((stagingData) =>
                <Option key={stagingData._id} value={stagingData._id}>{stagingData.name}</Option>
              )}
            </Select>

            <Button type="primary" className={styles.button}>save</Button>
          </Panel>


          <Panel header="Select Fields" key="2"
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
        </Collapse>
      </div>
    </div>
  );
}

export default connect(({dataAnalysis}) => ({dataAnalysis}))(WorkBench);
