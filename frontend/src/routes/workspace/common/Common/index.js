import React from 'react';
import {Spin} from 'antd';

import SideBar from '../components/SideBar/index';
import MiddleArea from '../components/MiddleArea/index';
import RightArea from '../components/RightArea/index';

import styles from './index.less';


function Common(props) {
  return (
    <div className={styles.container}>
      <Spin spinning={props.model.spinLoading.wholePage}>

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

    </div>
  );
}

export default Common;
