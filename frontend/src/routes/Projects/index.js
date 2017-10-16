import React from 'react'
import { connect } from 'dva'
import { Select, Button, Card } from 'antd'
import { showTime } from '../../utils'

import styles from './index.less'

const Option = Select.Option

function handleChange(value) {
  console.log(`selected ${value}`)
}

function toProjectDetail(id, history) {
  history.push(`/projects/${id}/import`)
}

function Projects({ history, project }) {
  console.log(project)
  return (
    <div className={styles.normal}>
      <div className={styles.header}>
        <Select defaultValue="lucy" style={{ width: 120 }} onChange={handleChange}>
          <Option value="jack">Jack</Option>
          <Option value="lucy">Lucy</Option>
          <Option value="disabled" disabled>Disabled</Option>
          <Option value="Yiminghe">yiminghe</Option>
        </Select>
        <Select defaultValue="lucy" style={{ width: 120 }} allowClear>
          <Option value="lucy">Lucy</Option>
        </Select>
        <Button className={styles.rightButton}>New Project</Button>
      </div>
      <div>
        {project.projects.owned_projects.map(e =>
          <Card key={e._id} title={e.name} style={{ width: '90%', marginLeft: 5 }}>
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
