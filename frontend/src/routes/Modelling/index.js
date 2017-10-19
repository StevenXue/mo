import React from 'react';
import {connect} from 'dva';
import styles from './index.less';

import SideBar from '../../components/SideBar';
import MiddleArea from '../../components/MiddleArea';
import RightArea from '../../components/RightArea';


function Modelling({location, dispatch, modelling}) {
  return (
    <div className={styles.container}>

      <div className={styles.content}>
        <div className={styles.sidebar}>
          <SideBar
            model={modelling}
            namespace='modelling'
            dispatch={dispatch}
          />
        </div>
        <div className={styles.middle_area}>
          <MiddleArea
            model={modelling}
            namespace='modelling'
            dispatch={dispatch}
          />
        </div>
        <div className={styles.right_area}>
          <RightArea/>
        </div>
      </div>
    </div>
  );
}


export default connect(({modelling}) => ({modelling}))(Modelling);
