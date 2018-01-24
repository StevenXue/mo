import React from 'react'
import {connect} from 'dva'
import {Select, Button, Card, Icon, Input} from 'antd'
import {showTime} from '../../utils/index'
import {routerRedux} from 'dva/router'

import styles from './index.less'

function ModuleList({history, module, dispatch}) {

  return (
    <div className={`main-container ${styles.normal}`}>
      <div className={styles.requestList}>
        {module.moduleList.map(e =>
          <Card key={e._id} title={e.name} className={styles.card}
                style={{cursor: 'pointer'}}
                onClick={() => dispatch(routerRedux.push('/modulelist/' + e._id))}
          >
            <div>
              <p>Description: {e.description}</p>
              <p>Create Time: {showTime(e.create_time)}</p>
            </div>
          </Card>)}
      </div>
    </div>
  )
}

export default connect(({module}) => ({module}))(ModuleList)
