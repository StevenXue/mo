/**
 * choose toolkit
 */
import React from 'react';
import styles from './index.less';
import {connect} from 'dva';

import {Tabs, Card, Icon} from 'antd';

const TabPane = Tabs.TabPane;

function callback(key) {
  console.log(key);
}

const config = [
  {
    name: 'K-mean',
    description: "xxxx"
  },
  {
    name: 'StandardScaler',
    description: "xxxx"
  }
];

function Launcher() {
  return (
    <div className={styles.launcher}>
      <h1>
        Choose a toolkit to start
      </h1>

      <Tabs defaultActiveKey="1" onChange={callback}>
        <TabPane tab="Data Explore" key="1">
          <Card style={{width: '100%', backgroundColor: '#F8F8F8'}}>

            <div className={styles.card_area}>
              <div>
                <p className='custom-title-font'>K-mean</p>
                <p className='custom-text-font'>xxx</p>
              </div>
              <Icon type="check-circle"/>
            </div>
          </Card>

        </TabPane>
        <TabPane tab="Data Quality Improve" key="2">Content of Tab Pane 2</TabPane>
        <TabPane tab="Feature Selection" key="3">Content of Tab Pane 3</TabPane>
      </Tabs>

    </div>
  );
}

export default connect(({}) => ({}))(Launcher);
