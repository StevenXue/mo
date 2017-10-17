/**
 * choose toolkit
 */
import React from 'react';
import styles from './index.less';
import {connect} from 'dva';

import { Tabs } from 'antd';
const TabPane = Tabs.TabPane;

function callback(key) {
  console.log(key);
}

function Launcher() {
  return (
    <div >
      <h1>
      Choose a toolkit to start
      </h1>

      {/*<Tabs defaultActiveKey="1" onChange={callback}>*/}
        {/*<TabPane tab="Data Explore" key="1">Content of Tab Pane 1</TabPane>*/}
        {/*<TabPane tab="Data Quality Improve" key="2">Content of Tab Pane 2</TabPane>*/}
        {/*<TabPane tab="Feature Selection" key="3">Content of Tab Pane 3</TabPane>*/}
      {/*</Tabs>*/}

    </div>
  );
}

export default connect(({}) => ({}))(Launcher);
