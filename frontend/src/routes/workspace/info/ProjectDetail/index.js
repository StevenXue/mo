import React from 'react'
import { Link, Route, Switch, } from 'react-router-dom'
import { connect } from 'dva'
import { Button, Col, Icon, Modal, Row, Spin, Tabs, Tag, Upload } from 'antd'
// pages
import Modelling from '../../modelling/Modelling/index'
// components
import ProjectModel from '../../../../components/ProjectModal/index'
import HelpModal from '../../../../components/HelpModal'
import { showTime } from '../../../../utils/index'
import styles from './index.less'
import _ from 'lodash'
import { message } from 'antd/lib/index'

const confirm = Modal.confirm
const TabPane = Tabs.TabPane

const pages = ['import', 'analysis', 'modelling', 'deploy']

const projectTypeDict = {
  app: [],
  module: ['help-modal'],
  dataset: [],
}

const myShowTime = (time, format = 'yyyy-MM-dd hh:mm') => {
  let date = new Date(time).Format(format)
  return date.toLocaleString()
}

function ProjectInfo({ market_use, match, history, location, dispatch, projectDetail, login }) {

  const projectId = match.params.projectId
  const user_ID = localStorage.getItem('user_ID')
  const userObjId = _.get(login, 'user._id')

  const props1 = {
    name: 'file',
    action: 'http://localhost:5000/file/project_file',
    headers: {
      authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    data: {
      'user_ID': user_ID,
      'project_id': projectId,
    },
    onChange(info) {
      if (info.file.status !== 'uploading') {
        console.log(info.file, info.fileList)
      }
      if (info.file.status === 'done') {
        message.success(`${info.file.name} file uploaded successfully`)
        window.open(`/#/workspace/${projectId}/${projectDetail.project.type}`)
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`)
      }
    },
  }
  const deleteProject = () => {
    confirm({
      title: 'Are you sure delete this project?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        dispatch({ type: 'projectDetail/delete', payload: { projectId } })
      },
    })
  }

  function appStarFavor(action) {
    dispatch({
      type: 'projectDetail/star_favor',
      payload: {
        entity_id: projectDetail.project['_id'],
        action: action,
        entity: projectDetail.project.type,
      },
    })
  }

  function callback(key) {
    // console.log(key);
  }

  if (location.pathname.split('/').length > 3) {
    // project 4 step pages
    return (
      <ProjectDetail match={match} history={history} location={location} projectDetail={projectDetail}
                     dispatch={dispatch}/>
    )
  } else {
    // project info page
    if (projectDetail.project) {

      // optional component list by project type
      const components = projectTypeDict[projectDetail.project.type]
      return (
        <div className={`main-container ${styles.normal}`}>
          {components.includes('help-modal') &&
          <HelpModal visible={!projectDetail.project.entered} projectType={projectDetail.project.type}/>}
          <div className={styles.info}>
            {/*info head*/}
            <div className={styles.name}>
              <h1>
                {market_use && <Icon
                  // type="star"
                  type={projectDetail.project.favor_users.includes(userObjId) ? 'star' : 'star-o'}
                  style={{ fontSize: '22px', color: '#34c0e2' }}
                  onClick={() => appStarFavor('favor')}/>}
                {projectDetail.project.name}&nbsp;
                {!market_use && <Icon type={projectDetail.project.privacy === 'private' ? 'lock' : 'unlock'}
                                      style={{ fontSize: 20 }}/>}
                {!market_use && <span className={styles.rightButton}>
                  <ProjectModel new={false} projectDetail={projectDetail}
                  >
                    <Button icon='edit' style={{ marginRight: 15 }}/>
                  </ProjectModel>
                  <Button icon='delete' onClick={() => deleteProject()}/>
                </span>}
              </h1>
              <p className={styles.text} style={{ fontSize: 14, marginTop: 6 }}>
                <Icon type="clock-circle-o" style={{ marginRight: 10 }}/>
                Create Time: {showTime(projectDetail.project.create_time)}
              </p>
            </div>

            {/*info body*/}
            <div className={styles.body}>
              <div className={styles.description}>
                <p>{projectDetail.project.description}</p>
              </div>
              <div className={styles.tags}>
                {projectDetail.project.tags.length > 0 ? projectDetail.project.tags.map(e =>
                    <Tag color="#EEEEEE"
                         style={{ color: '#666666' }}
                         key={e}>{e}</Tag>)
                  : <p style={{ color: 'rgba(0,0,0,0.54)' }}>(no tags)</p>}
              </div>
              <span>
                <span className={styles.generalSpan}>
                <Upload {...props1}>
                  <Button>
                    <Icon type="upload"/> Click to Upload
                  </Button>
                </Upload>
                </span>
                <span className={styles.enterNotebook}>
                  <Button type="primary"
                          onClick={() => {
                            // history.push(`/workspace/${match.params.projectId}/${projectDetail.project.type}`)
                            window.open(`/#/workspace/${projectId}/${projectDetail.project.type}`)
                          }}>
                    Notebook ->
                  </Button>

                </span>
              </span>
            </div>
          </div>

          {/*content tabs*/}
          <Tabs defaultActiveKey="2" onChange={callback} className={styles.jobs}>
            <TabPane tab="Overview" key="1">
              Some Description
              <br/>
              Some Description
              <br/>
              Some Description
            </TabPane>
            <TabPane tab="Jobs" key="2">
              <Jobs projectDetail={projectDetail} dispatch={dispatch}/>
            </TabPane>
            <TabPane tab="Examples" key="3">
              Some Description
              <br/>
              Some Description
              <br/>
              Some Description
            </TabPane>
          </Tabs>

        </div>
      )
    }
    return <Spin spinning={true}>Loading...</Spin>
  }
}

const Jobs = ({ projectDetail, dispatch }) => {
  return (
    <div>
      <h2>Jobs:
        <span className={styles.rightButton}>
                     <Button onClick={() => {window.open(`http://localhost:${projectDetail.project.tb_port}`)}}>
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
                      onClick={() => dispatch({ type: 'projectDetail/closeSession', sessionId: job.id })}/>
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
                      onClick={() => dispatch({ type: 'projectDetail/closeSession', terminalName: job.name })}/>
              </h4>
            </div>
          </div>)}
      </div>
    </div>

  )
}

ProjectInfo.defaultProps = {
  market_use: false,
}

function ProjectDetail({ match, history, location, dispatch, projectDetail }) {

  return (
    <div className={`main-container ${styles.normal}`}>
      {/*<div className={styles.step}>*/}
      {/*<Steps match={match} history={history} location={location}*/}
      {/*dispatch={dispatch} projectDetail={projectDetail}*/}
      {/*/>*/}
      {/*</div>*/}
      <Switch>
        <Route path="/workspace/:projectID/:type" component={Modelling}/>
        {/*<Route path="/workspace/:projectID/import/choice" component={DataImport}/>*/}
        {/*<Route path="/workspace/:projectID/import/preview" component={DataPreview}/>*/}
        {/*<Route path="/workspace/:projectID/import/select" component={DataSelection}/>*/}
        {/*<Route path="/workspace/:projectID/import/upload" component={UploadData}/>*/}
        {/*<Route path="/workspace/:projectID/import" component={StagedList}/>*/}
        {/*<Route path="/workspace/:projectID/analysis" component={DataAnalysis}/>*/}
        {/*<Route path="/workspace/:projectID/modelling" component={Modelling}/>*/}
        {/*<Route path="/workspace/:projectID/deploy" component={Deployment}/>*/}
      </Switch>
    </div>
  )
}

export default connect(({ projectDetail, login }) => ({ projectDetail, login }))(ProjectInfo)
