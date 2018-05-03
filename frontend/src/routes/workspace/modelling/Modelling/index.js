import React from 'react'
import { connect } from 'dva'

import styles from './index.less'
// import 'antd/lib/list/style/css';
import 'antd/dist/antd.css'


function JupyterLab() {

  return (
    <div className={styles.container} id='mo-jlContainer'>
    </div>
  )
}

export default connect()(JupyterLab)
