/**
 * choose toolkit
 */
import React, { Component } from 'react';
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

class Launcher extends Component {

  onClick = () => {
    // 更改选中状态

  };
  render() {
    return (
      <div className={styles.launcher}>
        <h1>
          Choose a toolkit to start
        </h1>

        <Tabs defaultActiveKey="1" onChange={callback}>
          <TabPane tab="Data Explore" key="1">
            {config.map((e, i)=>
              <Card key={e.name+i} style={{width: '100%', backgroundColor: '#F8F8F8'}}>
                <div className={styles.card_area}>
                  <div>
                    <p className='custom-title-font'>{e.name}</p>
                    <p className='custom-text-font'>{e.description}</p>
                  </div>
                  <Icon type="check-circle"
                        onClick={this.onClick}
                        style={{fontSize:20}}/>
                </div>
              </Card>
            )}


          </TabPane>
          <TabPane tab="Data Quality Improve" key="2">Content of Tab Pane 2</TabPane>
          <TabPane tab="Feature Selection" key="3">Content of Tab Pane 3</TabPane>
        </Tabs>

      </div>
    );
  }
}

// function Launcher() {
//
//
//
// }

export default connect(({dataAnalysis}) => ({dataAnalysis}))(Launcher);
