import React, {Component} from 'react';
import styles from './index.less';
import {connect} from 'dva';

import {Tabs} from 'antd';
// import {, Collapse, Button, Input} from 'antd';

const TabPane = Tabs.TabPane;

import Preview from './Preview/index';
import History from './History/index';

// todo 自己写tab 以实现样式自定义
const tabs = [
  {
    text: 'View',
    key: 0
  },
  {
    text: 'History',
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
        return <Preview {...this.props}/>;
      case 1:
        return <History {...this.props}/>;
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
                     backgroundColor: this.state.status===tab.key?'#34C0E2':'white',
                     color: this.state.status===tab.key?'white': 'grey',
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
