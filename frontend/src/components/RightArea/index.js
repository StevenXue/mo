import React, {Component} from 'react';
import styles from './index.less';
import {connect} from 'dva';

import {Tabs} from 'antd';
// import {, Collapse, Button, Input} from 'antd';

const TabPane = Tabs.TabPane;

import Preview from './Preview';
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


class RightArea extends Component {
  state = {
    status: 0
  };

  renderChildren(){
    switch (this.state.status) {
      case 0:
        return <Preview/>;
      case 1:
        return <div>
          Result
        </div>
    }

  }

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
          this.renderChildren()
        }
      </div>
    )
  }
}


export default RightArea;
