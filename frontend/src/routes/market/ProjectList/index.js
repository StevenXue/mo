import React, {Component} from 'react'
import {connect} from 'dva'
import {Select, Button, Card, Icon, Input, Avatar, Tabs} from 'antd'
import ProjectModel from '../../../components/ProjectModal/index'
import {showTime} from '../../../utils/index'
import {privacyChoices, projectChoices} from '../../../constants'
import {
  createProject,
  getProjects,
  getMyProjects
} from '../../../services/project'

import styles from './index.less'

const Option = Select.Option
const Search = Input.Search
const TabPane = Tabs.TabPane

function Projects({history, project, dispatch}) {

  function callback(key) {
    // console.log(key)
  }

  return (
    <div className={`main-container ${styles.normal}`}>
      <Tabs defaultActiveKey="1" onChange={callback}>
        <TabPane tab="Apps" key="1">
          <ProjectList {...{history, project, dispatch}} type='app'/>
        </TabPane>
        <TabPane tab="Modules" key="2">
          <ProjectList {...{history, project, dispatch}} type='module'/>
        </TabPane>
        <TabPane tab="Datasets" key="3">
          <ProjectList {...{history, project, dispatch}} type='dataset'/>
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
      user_obj_id: localStorage.getItem('user_obj_id')
    }
  }

  fetchData({payload}) {
    const {type} = this.props

    let filter = {type};
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
    this.fetchData({payload: {privacy: value === 'all' ? undefined : value}})
  }

  handleQueryChange(value) {
    this.fetchData({payload: {query: value}})
  }

  toProjectDetail(id, history, type, projectOwner, loginUser) {
    // this.props.dispatch({type: 'project/push', id, route: 'market'})
    if (projectOwner === loginUser) {
      history.push(`/workspace/${id}?type=${type}`)
    }
    else {
      history.push(`/market/${id}?type=${type}`)
    }
  }

  starFavor(action, id, type) {
    const user_obj_id = localStorage.getItem('user_obj_id')

    function findById(element) {
      return element._id === id
    }

    let toUpdateIndex = this.state.projects.findIndex(findById)
    console.log(toUpdateIndex)
    let toUpdate = this.state.projects[toUpdateIndex]
    if (action === 'star') {
      toUpdate.star_users.includes(user_obj_id) ? toUpdate.star_users.pop(user_obj_id) : toUpdate.star_users.push(user_obj_id)
    }
    else {
      toUpdate.favor_users.includes(user_obj_id) ? toUpdate.favor_users.pop(user_obj_id) : toUpdate.favor_users.push(user_obj_id)
    }
    this.props.dispatch({
      type: 'projectDetail/star_favor',
      payload: {
        entity_id: id,
        action: action,
        entity: type
      }
    })
  }

  render() {
    const {history, project, dispatch} = this.props
    console.log(this.state.projects)
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
            style={{width: 200}}
          />
        </div>
        <div className={styles.projectList}>
          {this.state.projects.map(e =>
            <ProjectCard key={e._id} project={e}
                         onClickToDetail={() => this.toProjectDetail(e._id, history, e.type, e.user, this.state.user_obj_id)}
                         onClickStarFavor={(action) => this.starFavor(action, e._id, e.type)}
            />
          )}
        </div>
      </div>
    )
  }
}

function ProjectCard({project, onClickToDetail, onClickStarFavor}) {
  const user_obj_id = localStorage.getItem('user_obj_id')
  console.log(project)
  return (
    <div className={styles.projectCard}>
      <div className={styles.toDetail} onClick={() => onClickToDetail()}>
        <div className={styles.pic}>
        </div>
        <div className={styles.name}>
          <p>{project.name}</p>
        </div>
        <div className={styles.description}>
          <p className={styles.p}>{project.description}</p>
        </div>
        <div>
          <div className={styles.authorDateDiv}>
            <div className={styles.authorDiv}><p
              className={styles.authorP}>AUTHOR</p><p>user</p></div>
            <div className={styles.dateDiv}><p className={styles.dateP}>DATE</p>
              <p>{showTime(project.create_time, "yyyy-MM-dd")}</p></div>
          </div>
          <div className={styles.categoryDiv}>
            <p className={styles.categoryP}>CATEGORY</p>
            <p>{project.category}</p></div>
        </div>
      </div>
      <div className={styles.starFavorDiv}>
        <div className={styles.starFavorRightDiv}>
          <Icon className={styles.bottomIcon}
                type={project.favor_users.includes(user_obj_id) ? "star" : "star-o"}
                onClick={() => onClickStarFavor('favor')}/>
          <p className={styles.bottomNumber}>{project.favor_users.length}</p>
          <Icon className={styles.bottomIcon}
                type={project.star_users.includes(user_obj_id) ? "like" : "like-o"}
                onClick={() => onClickStarFavor('star')}/>
          <p className={styles.bottomNumber}>{project.star_users.length}</p>
        </div>
      </div>
    </div>
  )
}


export default connect(({project}) => ({project}))(Projects)


// <Card noHovering={true}
// key={e._id} className={styles.card}
// title={e.name}
// extra={e.is_private && <Icon type="lock"/>}
// onClick={() => this.toProjectDetail(e._id, history)} style={{ cursor: 'pointer' }}>
// <div>
// <p className={styles.des}>{e.description}</p>
// <p className={styles.other}>
//   <Icon type="clock-circle-o" style={{ marginRight: 10 }}/>
//   {showTime(e.create_time)}
// </p>
// {/*<Icon type="user" style={{ marginRight: 10 }}/>*/}
// {/*{e['user_name'] && <p>Owner: {e.user_name}</p>}*/}
// </div>
// </Card>
