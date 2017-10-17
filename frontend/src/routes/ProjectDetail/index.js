import React from 'react'
import {
  Route,
  Link,
} from 'react-router-dom'
import { connect } from 'dva'
import { Select, Button } from 'antd'
import { withRouter} from "react-router-dom";

import DataAnalysis from '../DataAnalysis/DataAnalysis'
import Modelling from '../Modelling'
import DataImport from '../DataImport'

import styles from './index.less'
//
function ProjectDetail({ match, history, project }) {
  console.log(match, project)
  return (
    <div className={styles.normal}>
      <h2>Steps</h2>
      <Button onClick={() => history.push(`/projects/${match.params.projectID}/import`)}>Data Import</Button>
      <Button onClick={() => history.push(`/projects/${match.params.projectID}/analysis`)}>Data Analysis</Button>
      <Button onClick={() => history.push(`/projects/${match.params.projectID}/modelling`)}>Modelling</Button>
      <Button onClick={() => history.push(`/projects/${match.params.projectID}/deploy`)}>Deployment</Button>

      <Route path="/projects/:projectID/import" component={DataImport}/>
      <Route path="/projects/:projectID/analysis" component={DataAnalysis}/>
      <Route path="/projects/:projectID/modelling" component={Modelling}/>
      <Route path="/projects/:projectID/deploy" component={DataAnalysis}/>
    </div>
  )
}

export default connect(({ project }) => ({ project }))(ProjectDetail)
