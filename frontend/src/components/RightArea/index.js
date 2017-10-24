import React, {Component} from 'react';
import styles from './index.less';

import {Tabs, Select} from 'antd';
// import {, Collapse, Button, Input} from 'antd';

const TabPane = Tabs.TabPane;
const Option = Select.Option;

// todo 自己写tab 以实现样式自定义
const tabs = [
  {
    text: 'View',
    key: 0
  },
  {
    text: 'Result',
    key: 1
  }
];

function View () {

  function handleChange() {

  }
  return <div>
    view
    <div>

      <Select
        // key={arg.name + argIndex}
        // className={styles.select}
        showSearch
        style={{width: 200}}
        placeholder="Select a stagingData"
        optionFilterProp="children"
        onChange={(value) => handleChange(value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        defaultValue={arg.values[0]}
        filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
      >
        {stagingDataList.map((stagingData) =>
          <Option key={stagingData._id} value={stagingData._id}>{stagingData.name}</Option>
        )}
      </Select>

    </div>

  </div>
}


function Result () {
  return <div>
    Result
  </div>
}

const children = [
  <View />, <Result/>
];


class RightArea extends Component {
  state = {
    status: 0
  };

  render() {
    return (
      <div className="card-container">
        <div className={styles.row}>
          {
            tabs.map(tab=>

              <div className={styles.button}
                   key={tab.key}
                   style={{
                     backgroundColor: this.state.status===tab.key?'#34C0E2':'white'
                   }}
                   onClick={()=>{
                     this.setState({
                       status: tab.key
                     })
                   }}
              >
                {tab.text}
              </div>
            )
          }
        </div>
        {
          children[this.state.status]
        }
      </div>
    )
  }
}


export default RightArea;
