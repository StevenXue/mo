import React, { Component } from 'react'
import { connect } from 'dva'
import { Select, Button, Card, Icon, Input, Pagination, Tabs } from 'antd'
import ProjectModel from '../../../../components/ProjectModal/index'
import { showTime } from '../../../../utils/index'
import { privacyChoices, projectChoices } from '../../../../constants'
import { createProject, getProjects, getMyProjects } from '../../../../services/project'

import styles from './index.less'

const Option = Select.Option
const Search = Input.Search
const TabPane = Tabs.TabPane

function Projects({ history, project, dispatch, location }) {
  const defaultActiveKeyDic = { '?tab=app': '1', '?tab=module': '2', '?tab=dataset': '3' }
  const paramList = Object.keys(defaultActiveKeyDic)

  function callback(key) {
    history.push(`workspace${paramList[parseInt(key) - 1]}`)
  }

  return (
    <div className={`main-container ${styles.normal}`}>
      <Tabs defaultActiveKey={defaultActiveKeyDic[location.search]}
            onChange={callback}>
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
      projectType: 'project',

      query: undefined,
      privacy: undefined,
      totalNumber: 0,
      pageNo: 1,
      pageSize: 5,
    }
  }

  fetchData({ payload = {} }) {

    const { type } = this.props

    // default filter
    let filter = { type, group: 'my' };

    // get state filter
    ['query', 'privacy', 'page_no', 'page_size'].forEach((key) => {
      console.log('?',key,key.hyphenToHump())
      filter[key] = this.state[key.hyphenToHump()]
    })

    // update filter from args
    for (let key in payload) {
      filter[key] = payload[key]
      console.log('!',key,key.hyphenToHump())
      this.setState({
        [key.hyphenToHump()]: payload[key],
      })
    }

    // fetch
    getProjects({
      filter,
      onJson: ({ projects, count }) => this.setState({
        projects,
        totalNumber: count,
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

  toProjectDetail(id, history, type) {
    history.push(`/workspace/${id}?type=${type}`)
  }

  onShowSizeChange = (pageNo, pageSize) => {
    this.fetchData({ payload: { page_no: pageNo, page_size: pageSize } })
  }

  render() {
    const { history, project, dispatch } = this.props

    return (
      <div>
        <div className={styles.header}>
          <Select defaultValue='all' className={styles.select}
                  onChange={(value) => this.handlePrivacyChange(value)}>
            {privacyChoices.map(e =>
              <Option key={e.value} value={e.value}>{e.text}</Option>,
            )}
          </Select>
          <Search
            placeholder="input search text"
            onSearch={(value) => this.handleQueryChange(value)}
            style={{ width: 200 }}
          />
          <ProjectModel new={true} fetchData={() => this.fetchData({})} type={this.props.type}>
            <Button icon='plus-circle-o' type='primary' className={styles.rightButton}>New {this.props.type}</Button>
          </ProjectModel>
        </div>
        <div className={styles.projectList}>
          {this.state.projects.map(e =>
            <Card key={e._id} className={styles.card}
                  title={<h3>{e.name}</h3>}
                  extra={e.is_private && <Icon type="lock"/>}
                  onClick={() => this.toProjectDetail(e._id, history, e.type)} style={{ cursor: 'pointer' }}>
              <div>
                <p className={styles.des}>{e.description}</p>
                <p className={styles.other}>
                  <Icon type="clock-circle-o" style={{ marginRight: 10 }}/>
                  {showTime(e.create_time)}
                  <Button style={{ float: 'right' }}
                          onClick={(ev) => {
                            ev.stopPropagation()
                            window.open(`/#/workspace/${e._id}/${e.type}`)
                          }}>
                    Notebook ->
                  </Button>
                </p>
                {/*<Icon type="user" style={{ marginRight: 10 }}/>*/}
                {/*{e['user_name'] && <p>Owner: {e.user_name}</p>}*/}
              </div>
            </Card>)}
          {/*{project.projects.public_projects.map(e => e.name)}*/}
        </div>
        <div className={styles.pagination}>
          <Pagination showSizeChanger
                      onShowSizeChange={this.onShowSizeChange}
                      onChange={this.onShowSizeChange}
                      defaultCurrent={1}
                      defaultPageSize={5}
                      pageSizeOptions={['5', '10', '15', '20', '25']}
                      total={this.state.totalNumber}/>
        </div>
      </div>
    )
  }
}

export default connect(({ project }) => ({ project }))(Projects)
