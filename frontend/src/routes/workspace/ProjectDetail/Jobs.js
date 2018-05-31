import React from 'react'
import { Link, Route, Switch } from 'react-router-dom'
import {
  Button,
  Icon,
  Row,
  Col,
  Popover,
  Tag,
} from 'antd'
import styles from './index.less'
import { get } from 'lodash'
import Highlight from 'react-highlight'
import { showTime } from '../../../utils/index'

const myShowTime = (time, format = 'yyyy-MM-dd hh:mm') => {
  let date = new Date(time).Format(format)
  return date.toLocaleString()
}

const Jobs = ({ projectDetail, dispatch }) => {
  const tagSwitcher = {
    success: 'green',
    error: 'red',
    running: 'gold',
    terminated: 'green',
  }
  const blobDict = {
    busy: styles.bulbBusy,
    idle: styles.bulbIdle,
    starting: styles.bulbIdle,
    dead: styles.bulbDead,
  }

  const renderJob = (job, i) => {
    const ifLog = projectDetail.jobIds.includes(job._id)
    return <Col span={12} className={styles.jobReactCol} key={job._id}>
      <h4 className={styles.jobTitle}>
                <span>
                  {job.running_code ?
                    <Popover placement='topLeft'
                             trigger='hover'
                             content={<Highlight
                               className='Python hljs code-container inline-code-container'>
                               {job.running_code}
                             </Highlight>}
                    >
                      <span>{job.running_code.split('\n')[0]} ...</span>
                    </Popover> :
                    <span>
                      {job.running_module.user_ID}/{job.running_module.module.name}/{job.running_module.version}
                      </span>}
                  <Tag className={styles.tag}>{job.running_code ? 'function' : 'module'}</Tag>
                  <Tag className={styles.tag} color={tagSwitcher[job.status]}>{job.status}</Tag>
                </span>
        <Button size='small' onClick={() => {
          if (ifLog) {
            dispatch({
              type: 'projectDetail/removeJobLog',
              payload: job._id,
            })
          } else {
            dispatch({
              type: 'projectDetail/addJobLog',
              payload: job._id,
            })
          }
        }}>{ifLog ? 'Hide Log' : 'Show Log'}</Button>
      </h4>

      <p>Start Time: {showTime(job.create_time)}</p>
      <p><Icon type="clock-circle"/> {job.duration.toHHMMSS()}</p>
      {ifLog && <Highlight
        className={`accesslog hljs code-container inline-code-container ${styles.log}`}
      >
        {(job.logs.map(e => e.message).join('') || 'no log')}
      </Highlight>}
    </Col>
  }

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
          {projectDetail.sessions && projectDetail.sessions.filter(e => e.kernel.execution_state === 'idle').length}
          </span> idle&nbsp;&nbsp;&nbsp;&nbsp;
        <span className={styles.busy}>
          {projectDetail.sessions && projectDetail.sessions.filter(e => e.kernel.execution_state === 'busy').length}
          </span> busy&nbsp;&nbsp;&nbsp;&nbsp;
        {/*<span className={styles.error}>2</span> went error&nbsp;&nbsp;&nbsp;&nbsp;*/}
      </p>

      <h3 className={styles.subTitle}>Sessions (Notebooks):</h3>
      <div className={styles.jobCols}>
        {projectDetail.sessions !== undefined && projectDetail.sessions.map((session) => {
          return <div key={session.id} className={styles.jobCell}>
            <div className={styles.jobContainer}>
              <h4>{session.path}
                <Icon className={styles.shutDown} type='close'
                      onClick={() => dispatch({
                        type: 'projectDetail/closeSession',
                        sessionId: session.id,
                      })}/>
              </h4>
              <p className={styles.jobInfo}>
                <span className={blobDict[session.kernel.execution_state]}/>
                &nbsp;&nbsp;
                Last Activity: {myShowTime(session.kernel.last_activity)}</p>
            </div>
            <Row className={styles.jobReactRow} type="flex">
              {session.jobs !== undefined && session.jobs.map((job, i) => {
                  return renderJob(job, i)
                },
              )}
            </Row>
          </div>
        })}
        {Object.entries(projectDetail.jobs).map(([path, jobs]) =>
          <div key={path} className={styles.jobCell}>
            <div className={styles.jobContainer}>
              <h4>{path}</h4>
              <p className={styles.jobInfo}>
                <span className={blobDict.dead}/>
                &nbsp;&nbsp;
                No Activity
                </p>
            </div>
            <Row className={styles.jobReactRow} type="flex">
              {jobs !== undefined && jobs.map((job, i) => {
                  return renderJob(job, i)
                },
              )}
            </Row>
          </div>)}
        {/*{projectDetail.sessions[0] === undefined && 'No Running Sessions'}*/}
      </div>

      <h3 className={styles.subTitle}>Terminals:</h3>
      <div className={styles.jobCols}>
        {projectDetail.terminals !== undefined && projectDetail.terminals.map((job) =>
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
        {projectDetail.terminals && projectDetail.terminals[0] === undefined && 'No Running Terminals'}
      </div>
    </div>
  )
}

export default Jobs


