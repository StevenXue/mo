import React, {Component} from 'react';
import styles from './index.less';

import {Tabs} from 'antd';

const TabPane = Tabs.TabPane;

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
  return <div>
    view
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
