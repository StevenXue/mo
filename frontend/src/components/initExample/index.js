import React from 'react';
import styles from './Example.css';
import {connect} from 'dva';

function Example() {
  return (
    <div className={styles.normal}>
      Component: WorkBench
    </div>
  );
}

export default connect(({dataAnalysis}) => ({dataAnalysis}))(Example);
