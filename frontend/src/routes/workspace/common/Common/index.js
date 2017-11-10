import React from 'react';
import {Spin, Button} from 'antd';

import SideBar from '../components/SideBar/index';
import MiddleArea from '../components/MiddleArea/index';
import RightArea from '../components/RightArea/index';

import styles from './index.less';


function Common(props) {
  return (
    <div className={styles.container}>


      <Spin spinning={false}>

        <div className={styles.content}>
          <div className={styles.sidebar}>
            <SideBar
              {...props}
            />
          </div>
          <div className={styles.middle_area}>
            <MiddleArea
              {...props}
            />
          </div>
          <div className={styles.right_area}>
            <RightArea
              {...props}
            />
          </div>
        </div>
      </Spin>

      <div className={styles.go_guide}>
        <Button onClick={() => props.dispatch({
          type: props.namespace + '/setShowGuidance',
          payload: {
            showGuidance: true
          }
        })}>
          go to guidance
        </Button>
      </div>

    </div>
  );
}

export default Common;
