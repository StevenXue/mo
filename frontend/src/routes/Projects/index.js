import React from 'react'
import { connect } from 'dva'
import { Select, Button, Card } from 'antd'
import ProjectModel from '../../components/ProjectModel'
import { showTime } from '../../utils'
import { privacyChoices } from '../../constants'

import styles from './index.less'

const Option = Select.Option

function Projects({ history, project, dispatch }) {

  function handleChange(value) {
    dispatch({ type: 'project/fetch', privacy: value })
  }

  function toProjectDetail(id, history) {
    history.push(`/projects/${id}`)
  }

  return (
    <div className={`main-container ${styles.normal}`}>
      <div className={styles.header}>
        <Select defaultValue="all" className={styles.select} onChange={handleChange}>
          {privacyChoices.map(e =>
            <Option key={e.value} value={e.value}>{e.text}</Option>,
          )}
        </Select>
        {/*<Select defaultValue="lucy" className={styles.select}  allowClear>*/}
        {/*<Option value="lucy">Lucy</Option>*/}
        {/*</Select>*/}
        <ProjectModel new={true} >
          <Button icon='plus-circle-o' className={styles.rightButton}>New Project</Button>
        </ProjectModel>
      </div>
      <div className={styles.projectList}>
        {project.projects.map(e =>
          <Card key={e._id} title={e.name} className={styles.card}>
            <div onClick={() => toProjectDetail(e._id, history)} style={{ cursor: 'pointer' }}>
              <p>Description: {e.description}</p>
              <p>Create Time: {showTime(e.create_time)}</p>
              {e['user_name'] && <p>Owner: {e.user_name}</p>}
            </div>
          </Card>)}
        {/*{project.projects.public_projects.map(e => e.name)}*/}
      </div>
    </div>
  )
}

export default connect(({ project }) => ({ project }))(Projects)
