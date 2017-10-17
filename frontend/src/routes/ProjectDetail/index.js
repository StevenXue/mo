import React from 'react'
import {
  Route,
  Link,
} from 'react-router-dom'
import { connect } from 'dva'
import { Select, Button } from 'antd'

// pages
import DataImport from '../DataImport'
// import DataAnalysis from '../DataAnalysis/DataAnalysis'
import Modelling from '../Modelling'
import Deployment from '../Deployment'
// components
import Steps from '../../components/Steps'
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
            <p>Name: {projectDetail.project.name}</p>
            <p>Description: {projectDetail.project.description}</p>
          </div>
          <div className={styles.navCards}>

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
      <Steps match={match} history={history} location={location}/>
      <Route path="/projects/:projectID/import" component={DataImport}/>
      {/*<Route path="/projects/:projectID/analysis" component={DataAnalysis}/>*/}
      <Route path="/projects/:projectID/modelling" component={Modelling}/>
      <Route path="/projects/:projectID/deploy" component={Deployment}/>
    </div>
  )
}

export default connect(({ projectDetail }) => ({ projectDetail }))(ProjectInfo)
