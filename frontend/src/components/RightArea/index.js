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
                     backgroundColor: this.state.status==='view'?'#34C0E2':'white'
                   }}
              >
                {tab.text}
              </div>
            )
          }

          {/*<div className={styles.button}*/}
               {/*style={{*/}
                 {/*backgroundColor: this.state.status==='view'?'#34C0E2':'white'*/}
               {/*}}*/}
          {/*>*/}
            {/*View*/}
          {/*</div>*/}

          {/*<div className={styles.button}*/}
               {/*style={{*/}
                 {/*backgroundColor: this.state.status==='history'?'#34C0E2':'white'*/}
               {/*}}*/}
          {/*>*/}
            {/*History*/}
          {/*</div>*/}
        </div>

        {/*<Tabs*/}
          {/*type="card"*/}
          {/*tabBarStyle={{flex: 1, display: 'flex'}}*/}
        {/*>*/}
          {/*<TabPane tab="View" key="view">*/}
            {/*<p>Content of Tab Pane 1</p>*/}

          {/*</TabPane>*/}

          {/*<TabPane tab="History" key="history">*/}
            {/*<p>Content of Tab Pane 2</p>*/}

          {/*</TabPane>*/}
        {/*</Tabs>*/}
      </div>
    )
  }
}


export default RightArea;
