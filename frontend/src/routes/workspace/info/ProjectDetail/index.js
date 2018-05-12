import React from 'react'
import { Link, Route, Switch } from 'react-router-dom'
import Joyride from 'react-joyride'
import { connect } from 'dva'
import {
  Button,
  Col,
  Icon,
  Modal,
  Row,
  Spin,
  Tabs,
  Tag,
  Upload,
  Input,
  Form,
  Pagination,
  Card,
  Tooltip,
} from 'antd'
import { routerRedux } from 'dva/router'
// components
import ProjectModal from '../../../../components/ProjectModal/index'
import HelpModal from '../../../../components/HelpModal'
import ReactMdeEditor from '../../../../components/ReactMdeCom/reactMde'
import ProjectExample from '../../../../components/ProjectExample/projectExample'
import Jobs from './Jobs'

import { showTime } from '../../../../utils/index'
import styles from './index.less'
import { get } from 'lodash'
import { message } from 'antd/lib/index'
import ReactMarkdown from 'react-markdown'
import { flaskServer, hubServer } from '../../../../constants'
import dynamic from 'dva/dynamic'
import modelling from '../../../../models/modelling'
// import {fetchComments} from "../../../../services/comments"

const confirm = Modal.confirm
const TabPane = Tabs.TabPane
const { TextArea } = Input
const FormItem = Form.Item
const commitSvg = require('../../../../img/icon/git-commit.svg')

const pages = ['import', 'analysis', 'modelling', 'deploy']

const projectTypeDict = {
  app: ['help-modal'],
  module: ['help-modal'],
  dataset: ['help-modal'],
}

class CommitsList extends React.Component {
  render() {
    return (
      <div>
        {this.props.commits.map(e =>
          <div className={styles.commentDiv} key={e.newhexsha}>
            <Row type="flex" justify="space-around" align="middle">
              <Col span={2}>
                <div>
                  {e.version && <div className={styles.commitVersion}><Icon type="tag-o"/> {e.version}</div>
                  }
                  <div className={styles.commitHexsha}><img src={commitSvg} alt="commit"/> {e.newhexsha.slice(0, 7)}
                  </div>
                </div>
              </Col>
              <Col span={22} className={styles.commentCol}>
                <div>
                  <div className={styles.commentContent}>{e.message}</div>
                  <div
                    className={styles.commentCreateTime}>{showTime(e.timestamp)}</div>
                </div>
              </Col>

            </Row>
          </div>)}
      </div>)
  }
}

class CommentsList extends React.Component {
  constructor() {
    super()
    this.state = {
      comments: [],
      totalNumber: 0,
      pageNo: 1,
      pageSize: 10,
    }
  }

  toUserProfile(user_ID) {
    this.props.history.push(`/profile/${user_ID}`)
  }

  componentDidMount() {
  }

  onShowSizeChange = (current, pageSize) => {

    // const payload = {
    //   'pageNo': current,
    //   'pageSize': pageSize,
    //   'projectId': this.props.projectId
    // }
    this.props.dispatch({
      type: 'projectDetail/setCommentsPageNoSize',
      'pageNo': current,
      'pageSize': pageSize,
    })
    this.props.dispatch({
      type: 'projectDetail/fetchComments',
      'projectId': this.props.projectId,
    })
  }

  render() {
    const { dispatch, projectId, history } = this.props
    const userObjId = localStorage.getItem('user_obj_id')
    const picNumber = parseInt(userObjId.slice(10)) % 6
    return (
      <div>
        <div>
          {this.props.comments && this.props.comments.map(e =>
            <div className={styles.commentDiv}>
              <Row>
                <Col span={2} style={{ margin: '20px 0', textAlign: 'center' }}>
                  <div style={{ height: '80px', width: '80px' }}>
                    <img style={{ height: '80px', width: '80px',borderRadius:'40px'}}
                         src={e.user_ID===this.props.login.user_ID?`/pyapi/user/avatar/${e.user_ID}.jpeg`:this.props.login.userAvatar} alt="avatar"/>
                  </div>
                </Col>
                <Col span={20} className={styles.commentCol}>
                  <div>
                    <div className={styles.commentUserID}
                         onClick={() => this.toUserProfile(e.user_ID)}>{e.user_ID}</div>
                    <div className={styles.commentContent}>{e.comments}</div>
                    <div
                      className={styles.commentCreateTime}>{showTime(e.create_time)}</div>
                  </div>
                </Col>
              </Row>
            </div>)}
          <div className={styles.pagination}>
            <Pagination showSizeChanger
                        onShowSizeChange={this.onShowSizeChange.bind(this)}
                        onChange={this.onShowSizeChange}
                        defaultCurrent={this.props.pageNo}
                        defaultPageSize={this.props.pageSize}
                        pageSizeOptions={['5', '10', '15', '20', '25']}
                        total={this.props.totalNumber}/>
          </div>
        </div>
      </div>
    )
  }
}

class CommentForm extends React.Component {

  constructor() {
    super()
    this.state = {
      inputValue: '',
    }
  }

  handleSubmit = () => {
    this.props.dispatch({
      type: 'projectDetail/makeComment',
      payload: {
        comments: this.state.inputValue,
        comments_type: 'project',
        _id: this.props.projectId,
      },
    })
    this.setState({ inputValue: null })
  }

  handleInputChange(e) {
    this.setState({ inputValue: e.target.value })
  }

  render() {
    const { fetching, data, value, projects, inputValue } = this.state
    const userObjId = localStorage.getItem('user_obj_id')
    return (
      <div className="demo">
        <Row type="flex" justify="flex" align="top">
          <Col span={2} style={{ margin: '20px 0', textAlign: 'center' }}>
            <div style={{ height: '80px', width: '80px' }}>
              <img style={{ height: '80px', width: '80px',borderRadius:'40px' }}
              src={this.props.login.userAvatar}
                   alt="avatar"/>
            </div>
          </Col>
          <Col span={20} style={{ margin: '20px 0' }}>
            <TextArea value={inputValue}
                      placeholder="enter your comments.."
                      autosize={{ minRows: 5, maxRows: 50 }}
                      onChange={(e) => this.handleInputChange(e)}
            />
            <div style={{ margin: '20px 0' }}/>
            <Button
              type="primary"
              htmlType="submit"
              disabled={this.state.inputValue === ''}
              onClick={this.handleSubmit}
            >
              Post Comment
            </Button>
          </Col>
        </Row>
      </div>
    )
  }
}

export function projectStatus(project) {
  if (!project.status) {
    return <div/>
  }
  if (project.status === 'deploying') {
    return <Tag color='gold' style={{ cursor: 'default', marginLeft: 10 }}>Deploying <Icon
      type="loading"/></Tag>
  } else if (project.status === 'active') {
    return <Tag color='green' style={{ cursor: 'default', marginLeft: 10 }}>Online</Tag>
  } else {
    return <Tag color='grey' style={{ cursor: 'default', marginLeft: 10 }}>Offline</Tag>
  }
}

function ProjectInfo({ app, market_use, match, history, location, dispatch, projectDetail, login }) {
  const projectId = match.params.projectId
  const user_ID = localStorage.getItem('user_ID')
  const userObjId = localStorage.getItem('user_obj_id')


  const url = new URL(window.location.href.replace('/#', ''))
  const showTab = url.searchParams.get('tab')

  // const projectOwner = get(projectDetail, 'project.user')
  // const projectOwnerOrNot = (projectOwner === userObjId)
  const props1 = {
    name: 'file',
    action: flaskServer + '/file/project_file',
    headers: {
      authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    data: {
      'user_ID': user_ID,
      'project_id': projectId,
    },
    onChange(info) {
      if (info.file.status !== 'uploading') {
        console.log(info.file, info.fileList)
      }
      if (info.file.status === 'done') {
        message.success(`${info.file.name} file uploaded successfully`)
        window.open(`/#/workspace/${projectId}/${projectDetail.project.type}`)
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`)
      }
    },
  }
  const deleteProject = () => {
    confirm({
      title: 'Are you sure delete this project?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        dispatch({
          type: 'projectDetail/delete',
          payload: { projectId, type: projectDetail.project.type },
        })
      },
    })
  }

  function appStarFavor(action) {
    dispatch({
      type: 'projectDetail/starFavor',
      payload: {
        entity_id: projectDetail.project['_id'],
        action: action,
        entity: projectDetail.project.type,
      },
    })
  }

  function showOverviewEditState() {
    dispatch({
      type: 'projectDetail/showOverviewEditState',
    })
  }

  function hideOverviewEditState() {
    dispatch({
      type: 'projectDetail/hideOverviewEditState',
    })
  }

  // const callback = (activeKey) => {
  //   // dispatch({
  //   //   type: 'projectDetail/changeActiveTab',
  //   //   activeTab: activeKey,
  //   // })
  // }

  const cloudNote = () => {
    if (!market_use) {
      return <Row style={{ width: '110%', marginLeft: '-8%' }}>
        <Col span={14}>
      <span className={styles.generalSpan}>
      <Upload {...props1}>
        <Tooltip
          title='Files will be uploaded to your workspace, and archives will be auto unarchived into working directory.'>
        <Button className="qing" type="primary" ghost>
          <Icon type="upload"/> Click to Upload
        </Button>
        </Tooltip>
      </Upload>
        </span>
        </Col>
        <Col span={10}>
      <span className={styles.enterNotebook}>
      <Button type="primary"
              className="zi"
              onClick={() => {
                // history.push(`/workspace/${match.params.projectId}/${projectDetail.project.type}`)
                window.open(`/#/workspace/${projectId}/${projectDetail.project.type}`)
              }}>
        Notebook ->
      </Button>
    </span>
        </Col>
      </Row>
    }
    //   return <div style={{paddingBottom: '50px'}}><span>

    // </span></div>
  }

  if (location.pathname.split('/').length > 3) {
    // project 4 step pages
    return (
      <ProjectDetail app={app} match={match} history={history} location={location}
                     projectDetail={projectDetail}
                     dispatch={dispatch}/>
    )
  } else {
    // project info page
    if (projectDetail.project && projectDetail.project.type) {

      // optional component list by project type
      const components = projectTypeDict[projectDetail.project.type]

      class Cloud_1 extends React.Component {
        constructor() {
          super()
          this.state = {
            steps: [],
            // tourtip: 0,
            tourtip: 1, // 0: display tourtip, 0: not display tourtip
          }
        }

        componentDidMount() {
          fetch(`/pyapi/user/tourtip?user_ID=${localStorage.user_ID}`, { method: 'GET' })
            .then((response) => response.json())
            .then(({ response }) => {
              this.setState({
                tourtip: parseInt(response.user.tourtip),
              })
            })
        }

        addSteps = (steps) => {
          let newSteps = steps

          if (!Array.isArray(newSteps)) {
            newSteps = [newSteps]
          }

          if (!newSteps.length) {
            return
          }
          this.setState({
            steps: [...newSteps],
          })
        }

        //关闭tourtip时调用，此后登录不再显示tourtip
        noLearning = () => {
          fetch(`/pyapi/user/notourtip?user_ID=${localStorage.user_ID}`, { method: 'GET' })
        }

        render() {
          return (
            <div>
              {
                this.state.tourtip === 0 && <Joyride
                  ref={c => (this.joyride = c)}
                  debug={false}
                  locale={{
                    back: (<span style={{ color: '#34BFE2' }}>Back</span>),
                    close: (<span style={{ color: '#34BFE2' }}>Close</span>),
                    last: (<span style={{ color: '#34BFE2' }} onClick={this.noLearning}>Finish</span>),
                    next: (<span style={{ color: '#34BFE2' }}>Next</span>),
                    skip: (<span style={{ color: '#999999' }} onClick={this.noLearning}>Skip</span>),
                  }}
                  run={true}
                  showOverlay={true}
                  showSkipButton={true}
                  showStepsProgress={true}
                  steps={this.state.steps}
                  type='continuous'
                />
              }
              <Cloud_2 addSteps={this.addSteps}/>
            </div>
          )
        }
      }

      class Cloud_2 extends React.Component {
        constructor() {
          super()
          this.state = {}
        }

        componentDidMount() {
          this.props.addSteps(
            [{
              title: '',
              text: '进入项目开发环境',
              selector: '.zi',
              position: 'left',
              // isFixed:true,
              style: {
                borderRadius: 0,
                color: '#34BFE2',
                textAlign: 'center',
                width: '24rem',
                mainColor: '#ffffff',
                backgroundColor: '#ffffff',
                beacon: {
                  inner: '#0ae713 ',
                  outer: '#77Eb7c',
                },
                close: {
                  display: 'none',
                },
              },
            }, {
              title: '',
              text: '上传并解压代码或数据集到开发环境',
              selector: '.qing',
              position: 'left',
              // isFixed:true,
              style: {
                borderRadius: 0,
                color: '#34BFE2',
                textAlign: 'center',
                width: '24rem',
                mainColor: '#ffffff',
                backgroundColor: '#ffffff',
                beacon: {
                  inner: '#34BFE2',
                  outer: '#34BFE2',
                },
                close: {
                  display: 'none',
                },
              },
            }, {
              title: '',
              text: '下载在线的目录到本地进行开发',
              selector: '.mei',
              position: 'left',
              // isFixed:true,
              style: {
                borderRadius: 0,
                color: '#34BFE2',
                textAlign: 'center',
                width: '24rem',
                mainColor: '#ffffff',
                backgroundColor: '#ffffff',
                beacon: {
                  inner: '#34BFE2',
                  outer: '#34BFE2',
                },
                close: {
                  display: 'none',
                },
              },
            }],
          )
        }

        chooseColor(star_users,user,userObjId){
          if(user===userObjId){
            return styles.gray
          }
          else if(star_users.includes(userObjId))
          {
            return styles.blue
          }
          else{
            return styles.lightBlue
          }

        }


        render() {
          return (
            <div className={`main-container ${styles.normal}`}>
              {components.includes('help-modal') &&
              <HelpModal
                visible={!projectDetail.project.entered || projectDetail.helpModalVisible}
                projectType={projectDetail.project.type}/>}
              <div className={styles.info}>
                <Row>
                  <Col span={3} style={{ padding: '10px 42px' }}>
                    <div className={styles.bigIconNunberDiv}>
                      <div
                        className={this.chooseColor(projectDetail.project.star_users,projectDetail.project.user,userObjId)}
                        style={market_use ? { cursor: 'pointer' } : { cursor: 'default' }}
                        onClick={market_use ? () => appStarFavor('star') : null}
                      >
                        <p className={styles.icon}>
                          <Icon
                            type={projectDetail.project.star_users.includes(userObjId) ? 'like' : 'like-o'}/>
                        </p>
                        <p
                          className={styles.number}>{projectDetail.project.star_users.length}</p>
                      </div>
                      <div
                        className={this.chooseColor(projectDetail.project.favor_users,projectDetail.project.user,userObjId)}                        style={market_use ? { cursor: 'pointer' } : { cursor: 'default' }}
                        onClick={market_use ? () => appStarFavor('favor') : null}>
                        <p className={styles.icon}>
                          <Icon
                            type={projectDetail.project.favor_users.includes(userObjId) ? 'star' : 'star-o'}/>
                        </p>
                        <p
                          className={styles.number}>{projectDetail.project.favor_users.length}</p>
                      </div>
                    </div>
                  </Col>
                  <Col span={21} style={{ paddingRight: '50px' }}>
                    <div className={styles.name}>
                      {/* project header area */}
                      <h1 style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ display: 'flex', alignItems: 'center' }}>
                          {projectDetail.project.name}&nbsp;
                          {!market_use && <Icon
                            type={projectDetail.project.privacy === 'private' ? 'lock' : 'unlock'}
                            style={{ fontSize: 20 }}/>}
                          {
                            projectStatus(projectDetail.project)
                          }
                        </span>
                        {!market_use &&
                        <span className={styles.rightButton}>
                          <ProjectModal
                            new={false}
                            projectDetail={projectDetail}
                            type={projectDetail.project.type}
                          >
                          <Button icon='edit' style={{ marginRight: 15 }}/>
                        </ProjectModal>
                          {/* only private project can be deleted */}
                          {projectDetail.project.privacy === 'private' &&
                          <Button icon='delete' style={{ marginRight: 15, width: 32 }}
                                  onClick={() => deleteProject()}/>}
                          <Button icon='cloud-download-o' className="mei"
                                  style={{ width: 32, fontSize: 16 }}
                                  onClick={() => dispatch({
                                    type: 'projectDetail/showHelpModal',
                                  })}/>
                      </span>}
                      </h1>
                      <p className={styles.text}>
                        <Icon type="clock-circle-o" style={{ marginRight: 10 }}/>
                        Create
                        Time: {showTime(projectDetail.project.create_time)}
                      </p>
                    </div>
                    <div className={styles.descriptionDiv}>
                      <p
                        className={styles.descriptionP}>{projectDetail.project.description}</p>
                    </div>
                    <div className={styles.tags}>
                      {projectDetail.project.tags.length > 0 ? projectDetail.project.tags.map(e =>
                          <Tag color="#EEEEEE"
                               style={{ color: '#666666', cursor: 'default' }}
                               key={e}>{e}</Tag>)
                        : null}
                    </div>

                    {/* <div style={{paddingBottom: '50px'}}>
                    <span>
                      {!market_use && <span className={styles.generalSpan}>
                      <Upload {...props1}>
                        <Button className="qing">
                          <Icon type="upload"/> Click to Upload
                        </Button>
                      </Upload>
                      </span>}
                      <span className={styles.enterNotebook}>
                        <Button type="primary"
                                className="zi"
                                onClick={() => {
                                  // history.push(`/workspace/${match.params.projectId}/${projectDetail.project.type}`)
                                  window.open(`/#/workspace/${projectId}/${projectDetail.project.type}`)
                                }}>
                          Notebook 1->
                        </Button>
                      </span>
                    </span>
                    </div> */}
                  </Col>
                </Row>

                {/*info body*/}

              </div>
              {/*content tabs*/}
              <Tabs defaultActiveKey={showTab}
                    // onChange={callback}
                    // activeKey={projectDetail.activeTab}
                    tabBarExtraContent={cloudNote()}
                    className={styles.jobs}>
                <TabPane tab="Overview" key="1">
                  <div className={styles.reactMdeEditorDiv}>
                    {/*{!projectDetail.overviewEditState?<ReactMarkdown source={projectDetail.project.overview}/>:null}*/}
                    {/*{projectDetail.overviewEditState?<ReactMdeEditor*/}
                    {/*projectDetail={projectDetail} dispatch={dispatch}/>:null}*/}
                    <ReactMdeEditor
                      projectDetail={projectDetail} dispatch={dispatch}
                      market_use={market_use}/>
                  </div>
                </TabPane>
                {!market_use && <TabPane tab="Jobs" key="2">
                  <Jobs projectDetail={projectDetail} dispatch={dispatch}/>
                </TabPane>}
                {projectDetail.project.type === 'app' && projectDetail.project.status === 'active' ?
                  <TabPane
                    tab="Examples" key="3">
                    {projectDetail.project.args ?
                      <ProjectExample projectDetail={projectDetail}
                                      dispatch={dispatch}/> : null}
                  </TabPane> : null}
                <TabPane tab="Commits" key="4">
                  <CommitsList dispatch={dispatch} projectId={projectId}
                               commits={projectDetail.project.commits}
                               totalNumber={projectDetail.totalNumber}
                               pageSize={projectDetail.pageSize}
                               pageNo={projectDetail.pageNo}

                  />
                </TabPane>
                <TabPane tab="Comments" key="5">
                  <CommentForm dispatch={dispatch} projectId={projectId} login={login}/>
                  <CommentsList dispatch={dispatch} projectId={projectId}
                                comments={projectDetail.comments}
                                totalNumber={projectDetail.totalNumber}
                                pageSize={projectDetail.pageSize}
                                pageNo={projectDetail.pageNo}
                                history={history}
                                login={login}
                  />
                </TabPane>
              </Tabs>
            </div>
          )
        }
      }

      return (
        <Cloud_1 histroy={history}/>
      )
    } else {
      return <Spin spinning={true}>Loading...</Spin>
    }
  }
}

ProjectInfo.defaultProps = {
  market_use: false,
}

function ProjectDetail({ app, match, history, location, dispatch, projectDetail }) {
  return (
    <div className={`main-container ${styles.normal}`}>
      <Switch>
        <Route path="/workspace/:projectID/:type" component={dynamic({
          app,
          models: () => [
            modelling,
          ],
          component: () => import('../../modelling/Modelling'),
        })}/>
      </Switch>
    </div>
  )
}

export default connect(({ projectDetail, login }) => ({
  projectDetail,
  login,
}))(ProjectInfo)
