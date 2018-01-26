import React from 'react'
import {Card} from 'antd'
import {routerRedux} from 'dva/router'

import {showTime} from '../../utils/index'

import styles from './index.less'

function ModuleList({moduleList, dispatch}) {
  return (
    <div className={`main-container ${styles.normal}`}>
      <div className={styles.requestList}>
        {moduleList.map(e =>
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
export default ModuleList

