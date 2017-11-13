import React from 'react'
import {
  Route,
  Link,
  Switch
} from 'react-router-dom'
import { connect } from 'dva'
import { Icon, Tag, Button } from 'antd'

// pages
import StagedList from '../../DataSelection/Staged'
import DataPreview from '../../DataPreview/index'
// components
import Steps from '../../../components/Steps/index'
import MyCard from '../../../components/MyCard/index'

import { showTime } from '../../../utils/index'
import styles from './index.less'

function PublicProject({ match, history, location, dispatch, projectDetail }) {

  const handleFork = () => {
    dispatch({type:'projectDetail/fork'})
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
                  <Button type='primary' onClick={handleFork}>
                    Fork
                  </Button>
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
                    onClick={() => history.push(`/projects/${match.params.projectId}/import`)}/>
            <MyCard icon='line-chart' text='Data Analysis' style={{ marginRight: 50 }}
                    />
            <MyCard icon='edit' text='Model Design' style={{ marginRight: 50 }}
                    />
            <MyCard icon='api' text='Model Deployment'
                    />
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
        <Route path="/projects/:projectID/import" component={StagedList}/>
      </Switch>
    </div>
  )
}

export default connect(({ projectDetail }) => ({ projectDetail }))(PublicProject)
