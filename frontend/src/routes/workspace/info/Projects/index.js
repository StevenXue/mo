import React from 'react'
import { connect } from 'dva'
import { Select, Button, Card, Icon, Input, Avatar } from 'antd'
import ProjectModel from '../../../../components/ProjectModal/index'
import { showTime } from '../../../../utils/index'
import { privacyChoices, projectChoices } from '../../../../constants'

import styles from './index.less'

const Option = Select.Option
const Search = Input.Search;
const { Meta } = Card;

function Projects({ history, project, dispatch }) {

  function handlePrivacyChange(value) {
    dispatch({ type: 'project/fetch', payload: { privacy: value === 'all' ? undefined : value } })
  }

  function handleTypeChange(value) {
    dispatch({ type: 'project/fetch', payload: { projectType: value } })
  }

  function handleQueryChange(value) {
    dispatch({ type: 'project/fetch', payload: { query: value } })
  }

  function toProjectDetail(id, history) {
    history.push(`/workspace/${id}`)
  }

  return (
    <div className={`main-container ${styles.normal}`}>
      <div className={styles.header}>
        <Select defaultValue='all' className={styles.select}
                onChange={handlePrivacyChange}>
          {privacyChoices.map(e =>
            <Option key={e.value} value={e.value}>{e.text}</Option>,
          )}
        </Select>
        <Select defaultValue='project' className={styles.select}
                onChange={handleTypeChange}>
          {projectChoices.map(e =>
            <Option key={e.value} value={e.value}>{e.text}</Option>,
          )}
        </Select>
        <Search
          placeholder="input search text"
          onSearch={handleQueryChange}
          style={{ width: 200 }}
        />
        <ProjectModel new={true}>
          <Button icon='plus-circle-o' type='primary' className={styles.rightButton}>New Project</Button>
        </ProjectModel>
      </div>
      <div className={styles.projectList}>
        {project.projects.map(e =>
          <Card key={e._id} className={styles.card}
                title={e.name}
                extra={e.is_private && <Icon type="lock"/>}
                onClick={() => toProjectDetail(e._id, history)} style={{ cursor: 'pointer' }}>
            <div>
              <p className={styles.des}>{e.description}</p>
              <p className={styles.other}>
                <Icon type="clock-circle-o" style={{ marginRight: 10 }}/>
                {showTime(e.create_time)}
              </p>
              {/*<Icon type="user" style={{ marginRight: 10 }}/>*/}
              {/*{e['user_name'] && <p>Owner: {e.user_name}</p>}*/}
            </div>
          </Card>)}
        {/*{project.projects.public_projects.map(e => e.name)}*/}
      </div>
    </div>
  )
}

export default connect(({ project }) => ({ project }))(Projects)
