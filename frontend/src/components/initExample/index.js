import React from 'react';
import styles from './index.less';
import {connect} from 'dva';

function Example() {
  return (
    <div className={styles.normal}>
      Component: Example
    </div>
  );
}

export default connect(({dataAnalysis}) => ({dataAnalysis}))(Example);
