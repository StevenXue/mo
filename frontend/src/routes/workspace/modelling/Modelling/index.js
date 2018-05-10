import React from 'react'
import { connect } from 'dva'
import {Spin, Alert} from 'antd'
import styles from './index.less'
// import 'antd/lib/list/style/css';
import 'antd/dist/antd.css'


function JupyterLab() {

  return (
    <div className={styles.container} id='mo-jlContainer'>
      <Spin tip="JupyterLab Starting..." size='large'>

      </Spin>
    </div>
  )
}

export default connect()(JupyterLab)
