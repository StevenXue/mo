import React, { Component } from 'react';
import styles from './index.less';

import { Tabs } from 'antd';
const TabPane = Tabs.TabPane;

// todo 自己写tab 以实现样式自定义

class RightArea extends Component {
  state={
    status: 'view'
  };

  render() {
    return (
      <div className="card-container">
        <Tabs
          type="card"
          tabBarStyle={{flex:1, display:'flex'}}
        >
          <TabPane tab="View" key="view">
            <p>Content of Tab Pane 1</p>

          </TabPane>

          <TabPane tab="History" key="history">
            <p>Content of Tab Pane 2</p>

          </TabPane>
        </Tabs>
      </div>
    )
  }
}


export default RightArea;
