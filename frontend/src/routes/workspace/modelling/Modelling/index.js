import React from 'react'
import { connect } from 'dva'
import {Spin, Alert} from 'antd'
import styles from './index.less'
// import 'antd/lib/list/style/css';

function JupyterLab() {
  return (
    <div className={styles.container} id='mo-jlContainer'>
      <Spin tip="JupyterLab Loading..." size='large'>

      </Spin>
    </div>
  )
}

export default connect()(JupyterLab)
