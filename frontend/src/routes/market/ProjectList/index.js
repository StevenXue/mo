import React, {Component} from 'react'
import {connect} from 'dva'
import {Select, Icon, Input, Pagination, Tabs} from 'antd'
import ProjectModel from '../../../components/ProjectModal/index'
import {showTime} from '../../../utils/index'
import {privacyChoices, projectChoices} from '../../../constants'
import avatar1 from '../../../img/avatar/1.png'
import avatar2 from '../../../img/avatar/2.png'
import avatar3 from '../../../img/avatar/3.png'
import avatar4 from '../../../img/avatar/4.png'
import avatar5 from '../../../img/avatar/5.png'
import avatar6 from '../../../img/avatar/6.png'

const avatarList =[avatar1,avatar2,avatar3,avatar4,avatar5,avatar6]

import {
  createProject,
  getProjects,
  getMyProjects
} from '../../../services/project'

import styles from './index.less'

const Option = Select.Option
const Search = Input.Search
const TabPane = Tabs.TabPane

function Projects({history, project, dispatch,location}) {

  const defaultActiveKeyDic = {"?tab=app":"1","?tab=module":"2","?tab=dataset":"3"}
  const paramList = Object.keys(defaultActiveKeyDic)

  function callback(key) {
    history.push(`market${paramList[parseInt(key)-1]}`)
  }

  return (
    <div className={`main-container ${styles.normal}`}>
      <Tabs defaultActiveKey={defaultActiveKeyDic[location.search]} onChange={callback}>
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
      privacy: 'public',
      projectType: 'project',
      query: undefined,
      user_obj_id: localStorage.getItem('user_obj_id'),
      totalNumber: 0,
      pageNo: 1,
      pageSize: 8,
    }
  }

  fetchData({payload= {}}) {
    const {type} = this.props

    let filter = {type};
    ['query', 'privacy', 'page_no', 'page_size'].forEach((key) => {
      filter[key] = this.state[key.dashToHump()]
    })

    for (let key in payload) {
        filter[key] = payload[key]
        this.setState({
          [key.dashToHump()]: payload[key],
        })
    }
    console.log('filter', filter)

    getProjects({
      filter,
      onJson: ({projects, count}) => this.setState({
        projects,
        totalNumber: count,
      })
    })
  }

  componentDidMount() {
    this.fetchData({})
  }


  handleQueryChange(value) {
    this.fetchData({payload: {query: value}})
  }


  onShowSizeChange = (pageNo, pageSize) => {
    this.fetchData({ payload: { page_no: pageNo, page_size: pageSize } })
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
    console.log('action',action)
    function findById(element) {
      return element._id === id
    }

    let toUpdateIndex = this.state.projects.findIndex(findById)
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
        <div className={styles.pagination}>
          <Pagination showSizeChanger
                      onShowSizeChange={this.onShowSizeChange}
                      onChange={this.onShowSizeChange}
                      defaultCurrent={1}
                      defaultPageSize={8}
                      pageSizeOptions={['4','8', '16', '32']}
                      total={this.state.totalNumber}/>
        </div>
      </div>
    )
  }
}

function ProjectCard({project, onClickToDetail, onClickStarFavor}) {
  const user_obj_id = localStorage.getItem('user_obj_id')
  const picNumber = parseInt(project.user.slice(20))%6
  return (
    <div className={styles.projectCard}>
      <div className={styles.toDetail} onClick={() => onClickToDetail()}>
        <div className={styles.pic}>
          <img src={avatarList[picNumber]}  alt="avatar" />
        </div>
        <div className={styles.name}>
          <p className={styles.namep}>{project.name}</p>
        </div>
        <div className={styles.description}>
          <p className={styles.p}>{project.description}</p>
        </div>
        <div>
          <div className={styles.authorDateDiv}>
            <div className={styles.authorDiv}><p
              className={styles.authorP}>AUTHOR</p><p>{project.user_ID}</p></div>
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
                type={project.star_users.includes(user_obj_id) ? "like" : "like-o"}
                onClick={() => onClickStarFavor('star')}/>
          <p className={styles.bottomNumber}>{project.star_users.length}</p>
          <Icon className={styles.bottomIcon}
                type={project.favor_users.includes(user_obj_id) ? "star" : "star-o"}
                onClick={() => onClickStarFavor('favor')}/>
          <p className={styles.bottomNumber}>{project.favor_users.length}</p>
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
