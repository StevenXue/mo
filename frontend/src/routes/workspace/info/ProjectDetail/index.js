import React from 'react'
import {
  Route,
  Link,
  Switch,
} from 'react-router-dom'
import { connect } from 'dva'
import { Icon, Button, Tag, Modal, Tabs, Spin, Row, Col } from 'antd'

// pages
import DataImport from '../../../DataImport/index'
import DataAnalysis from '../../dataAnalysis/DataAnalysis/index'
import Modelling from '../../modelling/Modelling/index'
import Deployment from '../../../Deployment/index'
import UploadData from '../../../Upload/index'
import DataSelection from '../../../DataSelection/index'
import StagedList from '../../../DataSelection/Staged'
import DataPreview from '../../../DataPreview/index'
// components
import Steps from '../../../../components/Steps/index'
import MyCard from '../../../../components/MyCard/index'
import ProjectModel from '../../../../components/ProjectModal/index'
import { showTime } from '../../../../utils/index'
import styles from './index.less'

import { projectDetailIcon } from '../../../../utils/constant'

const confirm = Modal.confirm
const TabPane = Tabs.TabPane

const pages = ['import', 'analysis', 'modelling', 'deploy']

function ProjectInfo({ match, history, location, dispatch, projectDetail }) {

  const projectId = match.params.projectId

  const deleteProject = () => {
    confirm({
      title: 'Are you sure delete this project?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        dispatch({ type: 'projectDetail/delete', payload: { projectId } })
      }
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
      return (
        <div className={`main-container ${styles.normal}`}>
          <div className={styles.info}>
            {/*info head*/}
            <div className={styles.name}>
              <h1>
                {projectDetail.project.name}&nbsp;
                <Icon type={projectDetail.project.privacy === 'private'?'lock':'unlock'}
                      style={{ fontSize: 20}}/>
                <span className={styles.rightButton}>
                  <ProjectModel new={false} projectDetail={projectDetail}>
                    <Button icon='edit' style={{ marginRight: 15 }}/>
                  </ProjectModel>
                  <Button icon='delete' onClick={() => deleteProject()}/>
                </span>
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
                {projectDetail.project.tags.length > 0 ?
                  projectDetail.project.tags.map(e => <Tag color="#EEEEEE" style={{ color: '#666666' }}
                                                          key={e}>{e}</Tag>)
                  :<p style={{color: 'rgba(0,0,0,0.54)'}}>(no tags)</p>}
              </div>
              <div className={styles.enterNotebook}>
              <Button type="primary"
                      onClick={() => {
                        history.push(`/workspace/${match.params.projectId}/${projectDetail.project.type}`)
                        // FIXME
                        window.location.reload()
                      }}>
                Enter Notebook
              </Button>
              </div>
            </div>
          </div>

          {/*content tabs*/}
          <Tabs defaultActiveKey="1" onChange={callback} className={styles.jobs}>
            <TabPane tab="Overview" key="1">
              Some Description
              <br/>
              Some Description
              <br/>
              Some Description
            </TabPane>
            <TabPane tab="Jobs" key="2">
                <h2>Jobs: </h2>
                <p>
                  <span className={styles.done}>10</span> have done&nbsp;&nbsp;&nbsp;&nbsp;
                  <span className={styles.running}>9</span> are running&nbsp;&nbsp;&nbsp;&nbsp;
                  <span className={styles.error}>2</span> went error&nbsp;&nbsp;&nbsp;&nbsp;
                </p>
                {projectDetail.jobs.map((job) => <p key={job.id}>{job.path}</p>)}
                <Row>
                  <Col span={12}>col-12</Col>
                  <Col span={12}>col-12</Col>
                </Row>
                <Row>
                  <Col span={12}>col-12</Col>
                  <Col span={12}>col-12</Col>
                </Row>
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

export default connect(({ projectDetail }) => ({ projectDetail }))(ProjectInfo)
