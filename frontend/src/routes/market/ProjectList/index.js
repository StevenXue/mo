import React, { Component } from 'react'
import { connect } from 'dva'
import { Select, Button, Card, Icon, Input, Avatar, Tabs } from 'antd'
import ProjectModel from '../../../components/ProjectModal/index'
import { showTime } from '../../../utils/index'
import { privacyChoices, projectChoices } from '../../../constants'
import { createProject, getProjects, getMyProjects } from '../../../services/project'

import styles from './index.less'

const Option = Select.Option
const Search = Input.Search
const TabPane = Tabs.TabPane

function Projects({ history, project, dispatch }) {

  function callback(key) {
    // console.log(key)
  }

  return (
    <div className={`main-container ${styles.normal}`}>
      <Tabs defaultActiveKey="1" onChange={callback}>
        <TabPane tab="Apps" key="1">
          <ProjectList {...{ history, project, dispatch }} type='app'/>
        </TabPane>
        <TabPane tab="Modules" key="2">
          <ProjectList {...{ history, project, dispatch }} type='module'/>
        </TabPane>
        <TabPane tab="Datasets" key="3">
          <ProjectList {...{ history, project, dispatch }} type='dataset'/>
        </TabPane>
      </Tabs>
    </div>
  )
}

class ProjectList extends Component {
  constructor() {
    super()
    this.state = {
      projects: [],
      projectsLoading: false,
      privacy: undefined,
      projectType: 'project',
    }
  }

  fetchData({ payload }) {
    const { type } = this.props

    let filter = { type };
    ['query', 'privacy'].forEach((key) => {
      if (this.state[key]) {
        filter[key] = this.stats[key]
      }
    })
    if (payload) {
      for (let key in payload) {
        if (!payload.hasOwnProperty(key)) {
          continue
        }
        if (payload[key]) {
          filter[key] = payload[key]
          this.setState({
            key: payload[key],
          })
        }
      }
    }
    getProjects({
      filter,
      onJson: (projects) => this.setState({
        projects,
      })
    })
  }

  componentDidMount() {
    this.fetchData({})
  }

  handlePrivacyChange(value) {
    this.fetchData({ payload: { privacy: value === 'all' ? undefined : value } })
  }

  handleQueryChange(value) {
    this.fetchData({ payload: { query: value } })
  }

  toProjectDetail(id, history) {
    history.push(`/market/${id}`)
  }

  render() {
    const { history, project, dispatch } = this.props
    return (
      <div>
        <div className={styles.header}>
          {/*<Select defaultValue='all' className={styles.select}*/}
                  {/*onChange={(value) => this.handlePrivacyChange(value)}>*/}
            {/*{privacyChoices.map(e =>*/}
              {/*<Option key={e.value} value={e.value}>{e.text}</Option>,*/}
            {/*)}*/}
          {/*</Select>*/}
          <Search
            placeholder="input search text"
            onSearch={(value) => this.handleQueryChange(value)}
            style={{ width: 200 }}
          />
          {/*<ProjectModel new={true} fetchData={() => this.fetchData({})} type={this.props.type}>*/}
            {/*<Button icon='plus-circle-o' type='primary' className={styles.rightButton}>New {this.props.type}</Button>*/}
          {/*</ProjectModel>*/}
        </div>
        <div className={styles.projectList}>
          {this.state.projects.map(e =>
            <Card noHovering={true}
                  key={e._id} className={styles.card}
                  title={e.name}
                  extra={e.is_private && <Icon type="lock"/>}
                  onClick={() => this.toProjectDetail(e._id, history)} style={{ cursor: 'pointer' }}>
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
}

export default connect(({ project }) => ({ project }))(Projects)
