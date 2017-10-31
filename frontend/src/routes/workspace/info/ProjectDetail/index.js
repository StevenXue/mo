import React from 'react'
import {
  Route,
  Link,
  Switch
} from 'react-router-dom'
import { connect } from 'dva'
import { Icon, Button, Tag } from 'antd'

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
import ProjectModel from '../../../../components/ProjectModel/index'
import { showTime } from '../../../../utils/index'
import styles from './index.less'

const pages = ['import', 'analysis', 'modelling', 'deploy']

function ProjectInfo({ match, history, location, dispatch, projectDetail }) {

  const projectId = match.params.projectId

  function deleteProject() {
    dispatch({ type: 'projectDetail/delete', payload: { projectId } })
  }

  if (location.pathname.split('/').length > 3) {
    return (
      <ProjectDetail match={match} history={history} location={location} project={projectDetail}/>
    )
  } else {
    if (projectDetail.project) {
      return (
        <div className={`main-container ${styles.normal}`}>
          <div className={styles.info}>
            <div className={styles.name}>
              <h1>
                {projectDetail.project.name}
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
            <div className={styles.description}>
              <p>{projectDetail.project.description}</p>
            </div>
            <div className={styles.tags}>
              {projectDetail.project.tags.map(e => <Tag color="#EEEEEE" style={{ color: '#666666' }} key={e}>{e}</Tag>)}
            </div>
          </div>
          <div className={styles.navCards}>
            <MyCard icon='file-add' text='Data Import' style={{ marginRight: 50 }}
                    onClick={() => history.push(`/workspace/${match.params.projectId}/import`)}/>
            <MyCard icon='line-chart' text='Data Analysis' style={{ marginRight: 50 }}
                    onClick={() => history.push(`/workspace/${match.params.projectId}/analysis`)}/>
            <MyCard icon='edit' text='Model Design' style={{ marginRight: 50 }}
                    onClick={() => history.push(`/workspace/${match.params.projectId}/modelling`)}/>
            <MyCard icon='api' text='Model Deployment'
                    onClick={() => history.push(`/workspace/${match.params.projectId}/deploy`)}/>
          </div>
        </div>
      )
    }
    return <div/>
  }

}

function ProjectDetail({ match, history, location, project }) {

  return (
    <div className={`main-container ${styles.normal}`}>
      <div className={styles.step}>
        <Steps match={match} history={history} location={location}/>
      </div>
      <Switch>
        <Route path="/projects/:projectID/import/list" component={StagedList}/>
        <Route path="/workspace/:projectID/import/preview" component={DataPreview}/>
        <Route path="/workspace/:projectID/import/select" component={DataSelection}/>
        <Route path="/workspace/:projectID/import/upload" component={UploadData}/>
        <Route path="/workspace/:projectID/import" component={DataImport}/>
        <Route path="/workspace/:projectID/analysis" component={DataAnalysis}/>
        <Route path="/workspace/:projectID/modelling" component={Modelling}/>
        <Route path="/workspace/:projectID/deploy" component={Deployment}/>
      </Switch>
    </div>
  )
}

export default connect(({ projectDetail }) => ({ projectDetail }))(ProjectInfo)
