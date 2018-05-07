import React from 'react'
import { Link, Route, Switch } from 'react-router-dom'
import {
  Button,
  Icon,
} from 'antd'
import styles from './index.less'
import { get } from 'lodash'

const Jobs = ({ projectDetail, dispatch }) => {
  return (
    <div>
      <h2>Jobs:
        <span className={styles.rightButton}>
                     <Button onClick={() => {
                       window.open(`/tb/${localStorage.getItem('user_ID')}+${projectDetail.project.name}/`)
                     }}>
                       Jobs Visualization
                     </Button>
        </span>
      </h2>
      <p className={styles.overall}>
        <span className={styles.done}>
          {projectDetail.sessions.filter(e => e.kernel.execution_state === 'idle').length}
          </span> idle&nbsp;&nbsp;&nbsp;&nbsp;
        <span className={styles.busy}>
          {projectDetail.sessions.filter(e => e.kernel.execution_state === 'busy').length}
          </span> busy&nbsp;&nbsp;&nbsp;&nbsp;
        {/*<span className={styles.error}>2</span> went error&nbsp;&nbsp;&nbsp;&nbsp;*/}
      </p>

      <h3 className={styles.subTitle}>Sessions (Notebooks):</h3>
      <div className={styles.jobCols}>
        {projectDetail.sessions.map((job) => {
          const blobDict = {
            busy: styles.bulbBusy,
            idle: styles.bulbIdle,
          }
          return <div key={job.id} className={styles.jobCell}>
            <div className={styles.jobContainer}>
              <h4>{job.path}
                <Icon className={styles.shutDown} type='close'
                      onClick={() => dispatch({
                        type: 'projectDetail/closeSession',
                        sessionId: job.id,
                      })}/>
              </h4>
              <p className={styles.jobInfo}>
                <span className={blobDict[job.kernel.execution_state]}/>
                &nbsp;&nbsp;
                Last Activity: {myShowTime(job.kernel.last_activity)}</p>
            </div>
          </div>
        })}
      </div>

      <h3 className={styles.subTitle}>Terminals:</h3>
      <div className={styles.jobCols}>
        {projectDetail.terminals.map((job) =>
          <div key={job.name} className={styles.jobCell}>
            <div className={styles.jobContainer}>
              <h4>{'Terminal/'}{job.name}
                <Icon className={styles.shutDown} type='close'
                      onClick={() => dispatch({
                        type: 'projectDetail/closeSession',
                        terminalName: job.name,
                      })}/>
              </h4>
            </div>
          </div>)}
      </div>
    </div>
  )
}

export default Jobs
