import React from 'react'
import {
  Route,
  Link,
  Switch
} from 'react-router-dom'
import { connect } from 'dva'
import { Icon, Button, Tag } from 'antd'

// pages
import DataImport from '../DataImport'
import DataAnalysis from '../DataAnalysis'
import Modelling from '../Modelling'
import Deployment from '../Deployment'
import UploadData from '../Upload'
import DataSelection from '../DataSelection'
import DataPreview from '../DataPreview'
// components
import Steps from '../../components/Steps'
import MyCard from '../../components/MyCard'
import { showTime } from '../../utils'
import styles from './index.less'

const pages = ['import', 'analysis', 'modelling', 'deploy']

function ProjectInfo({ match, history, location, projectDetail }) {
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
                  <Button icon='edit' style={{ marginRight: 15 }} />
                  <Button icon='delete'/>
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
              {projectDetail.project.tags.map(e => <Tag color="#C1E4F6">{e}</Tag>)}
            </div>
          </div>
          <div className={styles.navCards}>
            <MyCard icon='file-add' text='Data Import' style={{ marginRight: 50 }}
                    onClick={() => history.push(`/projects/${match.params.projectID}/import`)}/>
            <MyCard icon='line-chart' text='Data Analysis' style={{ marginRight: 50 }}
                    onClick={() => history.push(`/projects/${match.params.projectID}/analysis`)}/>
            <MyCard icon='edit' text='Model Design' style={{ marginRight: 50 }}
                    onClick={() => history.push(`/projects/${match.params.projectID}/modelling`)}/>
            <MyCard icon='api' text='Model Deployment'
                    onClick={() => history.push(`/projects/${match.params.projectID}/deploy`)}/>
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
        <Route path="/projects/:projectID/import/preview" component={DataPreview}/>
        <Route path="/projects/:projectID/import/select" component={DataSelection}/>
        <Route path="/projects/:projectID/import/upload" component={UploadData}/>
        <Route path="/projects/:projectID/import" component={DataImport}/>
        <Route path="/projects/:projectID/analysis" component={DataAnalysis}/>
        <Route path="/projects/:projectID/modelling" component={Modelling}/>
        <Route path="/projects/:projectID/deploy" component={Deployment}/>
      </Switch>
    </div>
  )
}

export default connect(({ projectDetail }) => ({ projectDetail }))(ProjectInfo)
