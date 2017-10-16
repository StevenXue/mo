import React from 'react'
import {
  Route,
  Link,
} from 'react-router-dom'
import { connect } from 'dva'
import { Select, Button } from 'antd'
import { withRouter } from 'react-router-dom'

// pages
import DataAnalysis from '../DataAnalysis/DataAnalysis'
import Modelling from '../Modelling'

// components
import Steps from '../../components/Steps'

import styles from './index.less'

const pages = ['import', 'analysis', 'modelling', 'deploy']

function ProjectDetail({ match, history, location, project }) {
  console.log(match, project, location)
  // get active page name from url
  const [activePage] = location.pathname.split('/').slice(-1)
  return (
    <div className={styles.normal}>
      <h2>Steps</h2>
      <div className={styles.steps}>
       <Steps match={match} history={history} location={location} />
      </div>
      <Route path="/projects/:projectID/import" component={DataAnalysis}/>
      <Route path="/projects/:projectID/analysis" component={DataAnalysis}/>
      <Route path="/projects/:projectID/modelling" component={Modelling}/>
      <Route path="/projects/:projectID/deploy" component={DataAnalysis}/>
    </div>
  )
}

export default connect(({ project }) => ({ project }))(ProjectDetail)
