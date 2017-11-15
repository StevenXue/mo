import React from 'react'
import { connect } from 'dva'
import { Select, Spin, Card } from 'antd'
import { showTime } from '../../../utils/index'
import { privacyChoices } from '../../../constants'

import styles from './index.less'

const Option = Select.Option

function Projects({ history, project, dispatch }) {


  function toProjectDetail(id, history) {
    history.push(`projects/${id}`)
  }

  return (
    <div className={`main-container ${styles.normal}`}>
      {project.projectsLoading?
        <Spin/>
        :
        <div className={styles.projectList}>
          {project.projects.map(e =>
            <Card key={e._id} title={e.name} className={styles.card}
                  onClick={() => toProjectDetail(e._id, history)} style={{ cursor: 'pointer' }}>
              <div>
                <p>Description: {e.description}</p>
                <p>Create Time: {showTime(e.create_time)}</p>
                {e['user_name'] && <p>Owner: {e.user_name}</p>}
              </div>
            </Card>)}

        </div>
      }
    </div>
  )
}

export default connect(({ project }) => ({ project }))(Projects)
