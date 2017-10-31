import React from 'react';
import {connect} from 'dva';
import styles from './index.less';
import {Spin} from 'antd';

import SideBar from '../../components/SideBar';
import MiddleArea from '../../components/MiddleArea';
import RightArea from '../../components/RightArea';


function DataAnalysis({location, dispatch, dataAnalysis}) {
  const props = {
    model: dataAnalysis,
    namespace: 'dataAnalysis',
    dispatch: dispatch,
    // step 用来干嘛了？
    step: 'toolkit'
  };
  return (

    <div className={styles.container}>
      <Spin  spinning={dataAnalysis.spinLoading.wholePage}>

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


export default connect(({dataAnalysis}) => ({dataAnalysis}))(DataAnalysis);
