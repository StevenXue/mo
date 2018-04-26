import React from 'react'
import {Link, Route, Switch} from 'react-router-dom'
import Joyride from 'react-joyride'
import {connect} from 'dva'
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
  Card
} from 'antd'
// pages
import JupyterLab from '../../modelling/Modelling/index'
// components
import ProjectModal from '../../../../components/ProjectModal/index'
import HelpModal from '../../../../components/HelpModal'
import ReactMdeEditor from '../../../../components/ReactMdeCom/reactMde'
import ProjectExample from '../../../../components/ProjectExample/projectExample'

import {showTime} from '../../../../utils/index'
import styles from './index.less'
import {get} from 'lodash'
import {message} from 'antd/lib/index'
import ReactMarkdown from 'react-markdown'
import {avatarList, flaskServer, hubServer} from '../../../../constants'
// import {fetchComments} from "../../../../services/comments"

const confirm = Modal.confirm
const TabPane = Tabs.TabPane
const {TextArea} = Input
const FormItem = Form.Item
const commitSvg = require('../../../../img/icon/git-commit.svg')


const pages = ['import', 'analysis', 'modelling', 'deploy']

const projectTypeDict = {
  app: [],
  module: ['help-modal'],
  dataset: [],
}


class CommitsList extends React.Component {
  render() {
    return (
      <div>
        {this.props.commits.map(e =>
          <div className={styles.commentDiv} key={e.newhexsha}>
            <Row type="flex" justify="space-around" align="middle">
              <Col span={2} >
                <div>
                  {e.version && <div className={styles.commitVersion}><Icon type="tag-o" /> {e.version}</div>
                  }
                  <div className={styles.commitHexsha}><img src={commitSvg} alt="commit"/> {e.newhexsha.slice(0,7)}</div>
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
      'projectId': this.props.projectId
    })
  }

  render() {
    const {dispatch, projectId, history} = this.props
    const userObjId = localStorage.getItem('user_obj_id')
    const picNumber = parseInt(userObjId.slice(10)) % 6
    return (
      <div>
        <div>
          {this.props.comments && this.props.comments.map(e =>
            <div className={styles.commentDiv}>
              <Row>
                <Col span={2} style={{margin: '20px 0', textAlign:'center'}}>
                  <div style={{height: '60px', width:'60px'}}>
                    <img src={e.avatar?e.avatar:avatarList[picNumber]} alt="avatar"/>
                  </div>
                </Col>
                <Col span={20} className={styles.commentCol}>
                  <div>
                    <div className={styles.commentUserID} onClick={() => this.toUserProfile(e.user_ID)}>{e.user_ID}</div>
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
      }
    })
    this.setState({inputValue: null})
  }

  handleInputChange(e) {
    this.setState({inputValue: e.target.value})
  }

  render() {
    const {fetching, data, value, projects, inputValue} = this.state
    const userObjId = localStorage.getItem('user_obj_id')
    const picNumber = parseInt(userObjId.slice(10)) % 6
    return (
      <div className="demo">
        <Row type="flex" justify="flex" align="top">
          <Col span={2} style={{margin: '20px 0', textAlign:'center'}}>
            <div style={{height: '60px', width:'60px'}}>
              <img src={this.props.login.user.avatar?this.props.login.user.avatar:avatarList[picNumber]} alt="avatar"/>
            </div>
          </Col>
          <Col span={20} style={{margin: '20px 0'}}>
            <TextArea value={inputValue}
                      placeholder="enter your comments.."
                      autosize={{minRows: 5, maxRows: 50}}
                      onChange={(e) => this.handleInputChange(e)}
            />
            <div style={{margin: '20px 0'}}/>
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


const myShowTime = (time, format = 'yyyy-MM-dd hh:mm') => {
  let date = new Date(time).Format(format)
  return date.toLocaleString()
}

function ProjectInfo({market_use, match, history, location, dispatch, projectDetail, login}) {
  const projectId = match.params.projectId
  const user_ID = localStorage.getItem('user_ID')
  const userObjId = localStorage.getItem('user_obj_id')
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
          payload: {projectId, type: projectDetail.project.type}
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

  const callback = (activeKey) => {
    dispatch({
      type: 'projectDetail/changeActiveTab',
      activeTab: activeKey,
    })
  }

  const cloudNote = ()=>{
    return <Row style={{width:'110%',marginLeft:'-5%'}}>
      <Col span={13}>
      {!market_use && <span className={styles.generalSpan}>
      <Upload {...props1}>
        <Button className="qing">
          <Icon type="upload"/> Click to Upload
        </Button>
      </Upload>
    </span>}
      </Col>
      <Col span={11}>
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
  //   return <div style={{paddingBottom: '50px'}}><span>


  // </span></div>
  }

  if (location.pathname.split('/').length > 3) {
    // project 4 step pages
    return (
      <ProjectDetail match={match} history={history} location={location}
                     projectDetail={projectDetail}
                     dispatch={dispatch}/>
    )
  } else {
    // project info page
    if (projectDetail.project && projectDetail.project.type) {

      function projectStatus() {
        if (!projectDetail.project.status) {
          return <div/>
        }
        if (projectDetail.project.status === 'deploying') {
          return <Tag color='gold' style={{cursor: 'default',marginLeft:10}}>Deploying <Icon
            type="loading"/></Tag>
        } else if (projectDetail.project.status === 'active') {
          return <Tag color='green' style={{cursor: 'default',marginLeft:10}}>Online</Tag>
        } else {
          return <Tag color='grey' style={{cursor: 'default',marginLeft:10}}>Offline</Tag>
        }
      }

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
          fetch(`/pyapi/user/tourtip?user_ID=${localStorage.user_ID}`, {method: 'GET'})
            .then((response) => response.json())
            .then(({response}) => {
              this.setState({
                tourtip:parseInt( response.user.tourtip),
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
        noLearning = ()=>{
          fetch(`/pyapi/user/notourtip?user_ID=${localStorage.user_ID}`, {method: 'GET'})
        }

        render() {
          return (
            <div>
              {
                this.state.tourtip === 0 && <Joyride
                  ref={c => (this.joyride = c)}
                  debug={false}
                  locale={{
                    back: (<span style={{color: '#34BFE2'}} >Back</span>),
                    close: (<span style={{color: '#34BFE2'}}>Close</span>),
                    last: (<span style={{color: '#34BFE2'}} onClick={this.noLearning}>Last</span>),
                    next: (<span style={{color: '#34BFE2'}}>Next</span>),
                    skip: (<span style={{color: '#999999'}} onClick={this.noLearning}>Skip</span>),
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

        render() {
          return (
            <div className={`main-container ${styles.normal}`}>
              {components.includes('help-modal') &&
              <HelpModal
                visible={!projectDetail.project.entered || projectDetail.helpModalVisible}
                projectType={projectDetail.project.type}/>}
              <div className={styles.info}>
                <Row>
                  <Col span={3} style={{padding: '10px 42px'}}>
                    <div className={styles.bigIconNunberDiv}>
                      <div
                        className={projectDetail.project.star_users.includes(userObjId) ? styles.iconNunberDivActive : styles.iconNunberDiv}
                        style={market_use ? {cursor: 'pointer'} : {cursor: 'default'}}
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
                        className={projectDetail.project.favor_users.includes(userObjId) ? styles.iconNunberDivActive : styles.iconNunberDiv}
                        style={market_use ? {cursor: 'pointer'} : {cursor: 'default'}}
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
                  <Col span={21} style={{paddingRight: '50px'}}>
                    <div className={styles.name}>
                      {/* project header area */}
                      <h1>
                        <div style={{display:'flex',alignItems:'center'}}>
                          {projectDetail.project.name}&nbsp;
                          {!market_use && <Icon
                            type={projectDetail.project.privacy === 'private' ? 'lock' : 'unlock'}
                            style={{fontSize: 20}}/>}
                            {
                              projectStatus()
                            }
                        </div>
                        {!market_use && <span className={styles.rightButton}>
                          <ProjectModal new={false}
                                        projectDetail={projectDetail}
                                        type={projectDetail.project.type}
                          >
                          <Button icon='edit' style={{marginRight: 15}} style={{width:32}}/>
                        </ProjectModal>
                          {/* only private project can be deleted */}
                          {projectDetail.project.privacy === 'private' &&
                          <Button icon='delete' style={{marginRight: 15, marginLeft:15,width:32}}
                                  onClick={() => deleteProject()}/>}
                          <Button icon='cloud-download-o' className="mei"
                                  style={{width:32,fontSize:16}}
                                  onClick={() => dispatch({
                                    type: 'projectDetail/showHelpModal',
                                  })}/>
                      </span>}
                      </h1>
                      <p className={styles.text}>
                        <Icon type="clock-circle-o" style={{marginRight: 10}}/>
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
                               style={{color: '#666666', cursor: 'default'}}
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
              <Tabs defaultActiveKey={projectDetail.activeTab}
                    onChange={callback}
                    activeKey={projectDetail.activeTab}
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
                <TabPane tab="Comments" key="4">
                  <CommentForm dispatch={dispatch} projectId={projectId} login={login}/>
                  <CommentsList dispatch={dispatch} projectId={projectId}
                                comments={projectDetail.comments}
                                totalNumber={projectDetail.totalNumber}
                                pageSize={projectDetail.pageSize}
                                pageNo={projectDetail.pageNo}
                                history={history}
                  />
                </TabPane>
                <TabPane tab="Commits" key="5">
                  <CommitsList dispatch={dispatch} projectId={projectId}
                               commits={projectDetail.project.commits}
                               totalNumber={projectDetail.totalNumber}
                               pageSize={projectDetail.pageSize}
                               pageNo={projectDetail.pageNo}

                  />
                </TabPane>
              </Tabs>
            </div>
          )
        }
      }

      return (
        <Cloud_1 histroy={history}/>
        // <div className={`main-container ${styles.normal}`}>
        //   {/* <Joyride
        //     ref={c => (this.joyride = c)}
        //     // callback={this.callback}
        //     debug={false}
        //     // disableOverlay={selector === '.card-tickets'}
        //     locale={{
        //       back: (<span>Back</span>),
        //       close: (<span>Close</span>),
        //       last: (<span>Last</span>),
        //       next: (<span>Next</span>),
        //       skip: (<span>Skip</span>),
        //     }}
        //     run={true}
        //     showOverlay={true}
        //     showSkipButton={true}
        //     showStepsProgress={true}
        //     // stepIndex={stepIndex}
        //     steps={steps}
        //     type='continuous'
        //   /> */}
        //   {components.includes('help-modal') &&
        //   <HelpModal visible={!projectDetail.project.entered || projectDetail.helpModalVisible}
        //              projectType={projectDetail.project.type}/>}
        //   <div className={styles.info}>
        //     <Row>
        //       <Col span={3} style={{ padding: '10px 42px' }}>
        //         <div className={styles.bigIconNunberDiv}>
        //           <div
        //             className={projectDetail.project.star_users.includes(userObjId) ? styles.iconNunberDivActive : styles.iconNunberDiv}
        //             style={market_use ? { cursor: 'pointer' } : { cursor: 'default' }}
        //             onClick={market_use ? () => appStarFavor('star') : null}
        //           >
        //             <p className={styles.icon}>
        //               <Icon
        //                 type={projectDetail.project.star_users.includes(userObjId) ? 'like' : 'like-o'}/>
        //             </p>
        //             <p
        //               className={styles.number}>{projectDetail.project.star_users.length}</p>
        //           </div>
        //           <div
        //             className={projectDetail.project.favor_users.includes(userObjId) ? styles.iconNunberDivActive : styles.iconNunberDiv}
        //             style={market_use ? { cursor: 'pointer' } : { cursor: 'default' }}
        //             onClick={market_use ? () => appStarFavor('favor') : null}>
        //             <p className={styles.icon}>
        //               <Icon
        //                 type={projectDetail.project.favor_users.includes(userObjId) ? 'star' : 'star-o'}/>
        //             </p>
        //             <p
        //               className={styles.number}>{projectDetail.project.favor_users.length}</p>
        //           </div>
        //         </div>
        //       </Col>
        //       <Col span={21} style={{ paddingRight: '50px' }}>
        //         <div className={styles.name}>
        //           <h1>
        //             {projectDetail.project.name}&nbsp;
        //             {!market_use && <Icon
        //               type={projectDetail.project.privacy === 'private' ? 'lock' : 'unlock'}
        //               style={{ fontSize: 20 }}/>}
        //             {!market_use && <span className={styles.rightButton}>
        //           <ProjectModal new={false} projectDetail={projectDetail}
        //                         type={projectDetail.project.type}
        //           >
        //             <Button icon='edit' style={{ marginRight: 15 }}/>
        //           </ProjectModal>
        //           <Button icon='delete' style={{ marginRight: 15 }} onClick={() => deleteProject()}/>
        //               <Button icon='cloud-download-o' id="#area-chart" onClick={() => dispatch({
        //                 type: 'projectDetail/showHelpModal',
        //               })}/>
        //         </span>}
        //           </h1>
        //           <p className={styles.text}>
        //             <Icon type="clock-circle-o" style={{ marginRight: 10 }}/>
        //             Create Time: {showTime(projectDetail.project.create_time)}
        //           </p>
        //         </div>
        //         <div className={styles.descriptionDiv}>
        //           <p
        //             className={styles.descriptionP}>{projectDetail.project.description}</p>
        //         </div>
        //         <div className={styles.tags}>
        //           {projectDetail.project.tags.length > 0 ? projectDetail.project.tags.map(e =>
        //               <Tag color="#EEEEEE"
        //                    style={{ color: '#666666', cursor: 'default' }}
        //                    key={e}>{e}</Tag>)
        //             : null}
        //         </div>
        //         <div style={{ paddingBottom: '50px' }}>
        //       <span>
        //         {!market_use && <span className={styles.generalSpan}>
        //         <Upload {...props1}>
        //           <Button>
        //             <Icon type="upload"/> Click to Upload2
        //           </Button>
        //         </Upload>
        //         </span>}
        //         <span className={styles.enterNotebook}>
        //           <Button type="primary"
        //                   onClick={() => {
        //                     // history.push(`/workspace/${match.params.projectId}/${projectDetail.project.type}`)
        //                     window.open(`/#/workspace/${projectId}/${projectDetail.project.type}`)
        //                   }}>
        //             Notebook ->
        //           </Button>
        //         </span>
        //       </span>
        //         </div>
        //       </Col>
        //     </Row>

        //     {/*info body*/}

        //   </div>
        //   {/*content tabs*/}
        //   <Tabs defaultActiveKey="1" onChange={callback}
        //         activeKey = {projectDetail.activeTab}
        //         tabBarExtraContent={appStatus()}
        //         className={styles.jobs}>
        //     <TabPane tab="Overview" key="1">
        //       <div className={styles.reactMdeEditorDiv}>
        //         {/*{!projectDetail.overviewEditState?<ReactMarkdown source={projectDetail.project.overview}/>:null}*/}
        //         {/*{projectDetail.overviewEditState?<ReactMdeEditor*/}
        //         {/*projectDetail={projectDetail} dispatch={dispatch}/>:null}*/}
        //         <ReactMdeEditor
        //           projectDetail={projectDetail} dispatch={dispatch} market_use={market_use}/>
        //       </div>
        //     </TabPane>
        //     {!market_use && <TabPane tab="Jobs" key="2">
        //       <Jobs projectDetail={projectDetail} dispatch={dispatch}/>
        //     </TabPane>}
        //     {projectDetail.project.type==='app' && projectDetail.project.status==='active'?  <TabPane tab="Examples" key="3">
        //       {projectDetail.project.args ? <ProjectExample projectDetail={projectDetail}
        //                                                     dispatch={dispatch}/> : null}
        //     </TabPane>:null}
        //   </Tabs>
        // </div>
      )
    } else {
      return <Spin spinning={true}>Loading...</Spin>
    }
  }
}

const Jobs = ({projectDetail, dispatch}) => {
  return (
    <div>
      <h2>Jobs:
        <span className={styles.rightButton}>
                     <Button onClick={() => {
                       window.open(`/tb/${localStorage.getItem('user_ID')}+${projectDetail.project.name}/`)
                     }}>
                       Jobs Visualization
                     </Button>
        </span>
      </h2>
      <p className={styles.overall}>
        <span className={styles.done}>
          {projectDetail.sessions.filter(e => e.kernel.execution_state === 'idle').length}
          </span> idle&nbsp;&nbsp;&nbsp;&nbsp;
        <span className={styles.busy}>
          {projectDetail.sessions.filter(e => e.kernel.execution_state === 'busy').length}
          </span> busy&nbsp;&nbsp;&nbsp;&nbsp;
        {/*<span className={styles.error}>2</span> went error&nbsp;&nbsp;&nbsp;&nbsp;*/}
      </p>

      <h3 className={styles.subTitle}>Sessions (Notebooks):</h3>
      <div className={styles.jobCols}>
        {projectDetail.sessions.map((job) => {
          const blobDict = {
            busy: styles.bulbBusy,
            idle: styles.bulbIdle,
          }
          return <div key={job.id} className={styles.jobCell}>
            <div className={styles.jobContainer}>
              <h4>{job.path}
                <Icon className={styles.shutDown} type='close'
                      onClick={() => dispatch({
                        type: 'projectDetail/closeSession',
                        sessionId: job.id,
                      })}/>
              </h4>
              <p className={styles.jobInfo}>
                <span className={blobDict[job.kernel.execution_state]}/>
                &nbsp;&nbsp;
                Last Activity: {myShowTime(job.kernel.last_activity)}</p>
            </div>
          </div>
        })}
      </div>

      <h3 className={styles.subTitle}>Terminals:</h3>
      <div className={styles.jobCols}>
        {projectDetail.terminals.map((job) =>
          <div key={job.name} className={styles.jobCell}>
            <div className={styles.jobContainer}>
              <h4>{'Terminal/'}{job.name}
                <Icon className={styles.shutDown} type='close'
                      onClick={() => dispatch({
                        type: 'projectDetail/closeSession',
                        terminalName: job.name,
                      })}/>
              </h4>
            </div>
          </div>)}
      </div>
    </div>
  )
}

ProjectInfo.defaultProps = {
  market_use: false,
}

function ProjectDetail({match, history, location, dispatch, projectDetail}) {

  return (
    <div className={`main-container ${styles.normal}`}>
      <Switch>
        <Route path="/workspace/:projectID/:type" component={JupyterLab}/>
      </Switch>
    </div>
  )
}

export default connect(({projectDetail, login}) => ({
  projectDetail,
  login,
}))(ProjectInfo)
