import React from 'react'
import { connect } from 'dva'

import styles from './index.less'


function JupyterLab() {

  return (
    <div className={styles.container} id='mo-jlContainer'>
    </div>
  )
}

export default connect()(JupyterLab)
