import React, {Component} from 'react'
import {connect} from 'dva'
import {
  Card,
  Tabs,
  Icon,
  Radio,
  Row,
  Col,
  Input,
  Pagination,
  Button
} from 'antd'

const TabPane = Tabs.TabPane
const {Meta} = Card
const Search = Input.Search

import  {avatarList} from  '../../constants'


import styles from './index.less'
import {fetchAllUserRequest} from "../../services/userRequest"
import {getStarFavor} from "../../services/user"
import {fetchUserRequestAnswerByUserID} from "../../services/userRequestAnwser"
import {showTime} from "../../utils"
import {routerRedux} from "dva/router"

const RadioGroup = Radio.Group
const ButtonGroup = Button.Group

function callback(key) {
  console.log(key)
}

function toWorkspace(dispatch, tabPane) {
  dispatch(routerRedux.push({
    pathname: `/workspace`,
    search: tabPane,
  }))
}


// class Profile extends Component {
//   constructor() {
//     super()
//     this.state = {
//     }
//   }
// }


function Profile({login, profile, dispatch, history}) {
  if (profile.userInfo) {
    const {age, email, name, phone, user_ID,avatar} = profile.userInfo
    const {projectNumber} = profile
    const picNumber = parseInt(profile.userInfo._id.slice(20))%6
    return (
      <div className={`main-container ${styles.container}`}>
        <div className={styles.headerRow}>
          <Row>
            <Col span={3} style={{padding: '20px 0 0 20px'}}>
              <div className={styles.photoDiv}>
                <img src={avatar?avatar:avatarList[picNumber]}  alt="avatar" />
              </div>
            </Col>
            <Col span={21}>
              <div>
                <div className={styles.name}>
                  {user_ID}
                </div>
                <div>
                  <Row type="flex" justify="start">
                    <Col span={2}>
                      <div className={styles.appDiv}
                           onClick={() => toWorkspace(dispatch, 'tab=app')}>
                        <p className={styles.appText}>App</p>
                        <p
                          className={styles.appNumber}>{projectNumber ? projectNumber[0] : null}</p>
                      </div>
                    </Col>
                    <Col span={1}>
                      <div className={styles.divider}>
                        <div className={styles.dividerDiv}/>
                      </div>
                    </Col>
                    <Col span={2}>
                      <div className={styles.appDiv}
                           onClick={() => toWorkspace(dispatch, 'tab=module')}>
                        <p className={styles.appText}>Module</p>
                        <p
                          className={styles.appNumber}>{projectNumber ? projectNumber[1] : null}</p>
                      </div>
                    </Col>
                    <Col span={1}>
                      <div className={styles.divider}>
                        <div className={styles.dividerDiv}/>
                      </div>
                    </Col>
                    <Col span={2}>
                      <div className={styles.appDiv}
                           onClick={() => toWorkspace(dispatch, 'tab=dataset')}>
                        <p className={styles.appText}>Dataset</p>
                        <p
                          className={styles.appNumber}>{projectNumber ? projectNumber[2] : null}</p>
                      </div>
                    </Col>
                  </Row>
                </div>
              </div>
            </Col>
          </Row>
        </div>
        <div className={styles.tabsDiv}>
          <Tabs className={styles.tabs}
                defaultActiveKey="1"
                onChange={callback}>
            <TabPane tab="Favourite" key="1">
              <MyFavouriteList history={history} user_ID={user_ID}/>
            </TabPane>
            <TabPane tab="My request" key="2">
              <MyRequestList history={history} user_ID={user_ID}/>
            </TabPane>
            <TabPane tab="My answer" key="3">
              <MyAnswerList history={history} user_ID={user_ID}/>
            </TabPane>
          </Tabs>
        </div>
      </div>
    )
  }
  else {
    return <div/>
  }
}

class MyFavouriteList extends Component {
  constructor() {
    super()
    this.state = {
      pOrR: 'project',
      objects: [],
      totalNumber: 0,
      pageNo: 1,
      pageSize: 10,
      type: 'app',
    }
  }

  changePOrR(pOrR) {
    console.log(pOrR)
    this.setState({
      pOrR: pOrR,
      pageNo: 1,
      pageSize: 10,
      objects: []
    }, () => this.fetchData({}))
  }


  fetchData({payload}) {
    if (payload) {
      payload['user_ID'] = this.props.user_ID
    }
    else {
      payload = {'user_ID': this.props.user_ID}
    }
    payload['page_no'] = this.state.pageNo
    payload['page_size'] = this.state.pageSize
    if (this.state.pOrR === 'request') {
      payload['action_entity'] = 'request_star'
      payload['type'] = this.state.type
    }
    else {
      payload['action_entity'] = 'favor_'.concat(this.state.type).concat('s')
    }

    getStarFavor({
      payload,
      onJson: ({objects: objects, count: totalNumber}) => {
        this.setState({
          objects, totalNumber
        })
        console.log(this.state.objects)
      }
    })
  }


  componentDidMount() {
    this.fetchData({
      payload: {}
    })
  }

  handleQueryChange(value) {
    this.fetchData({
      payload: {
        search_query: value,
      }
    })
  }

  toObjectDetail(id, history) {
    history.push(`/explore/${id}`)
  }

  toUserRequestDetail(id, history) {
    history.push(`/userrequest/${id}`)
  }

  onShowSizeChange = (current, pageSize) => {
    this.setState({
      pageNo: current,
      pageSize: pageSize
    }, () => this.fetchData({payload: {}}))
  }

  typeChange = (e) => {
    console.log('radio checked', e.target.value)
    this.setState({
      type: e.target.value,
      pageNo: 1,
    }, () => this.fetchData({}))
  }

  render() {
    const {history, project, dispatch} = this.props
    return (
      <div className={styles.bottomRow}>
        <div className={styles.radioGroupDiv}>
          <ButtonGroup>
            <Button onClick={() => this.changePOrR('project')}
                    type={this.state.pOrR === 'project' ? "primary" : "default"}>
              Project</Button>
            <Button onClick={() => this.changePOrR('request')}
                    type={this.state.pOrR === 'request' ? "primary" : "default"}>
              Request</Button>
          </ButtonGroup>
          <RadioGroup onChange={this.typeChange}
                      value={this.state.type}>
            <Radio value={'app'} className={styles.radio}>App</Radio>
            <Radio value={'module'}
                   className={styles.radio}>Module</Radio>
            <Radio value={'dataset'}
                   className={styles.radio}>Dataset</Radio>
          </RadioGroup>
          <Search className={styles.search}
                  placeholder="input search text"
                  onSearch={(value) => this.handleQueryChange(value)}
                  style={{width: 200}}
          />
        </div>
        {this.state.pOrR === 'project' &&
        <div className={styles.favorList}>
          {this.state.objects.map(e =>
            <Card noHovering={true} key={e._id} bordered={true}>
              <div>
                <Row>
                  <div>
                    <div>
                      <p className={styles.title}
                         onClick={() => this.toObjectDetail(e._id, history)}>{e.name}</p>
                    </div>
                    <div>
                      <p className={styles.description}>{e.description}</p>
                    </div>
                    <div className={styles.footer}>
                      <Icon type="user" className={styles.firstIcon}/>
                      <p>{e.user_ID} </p>
                      {/* <Icon type="tags" className={styles.otherIcon}/> */}
                      <p>{e.tags}</p>
                      <Icon type="clock-circle-o" className={styles.otherIcon}/>
                      <p>{showTime(e.create_time)}</p>
                    </div>
                  </div>
                  {/*<div className={styles.timeAndUserDiv}>*/}
                  {/*<p*/}
                  {/*className={styles.showTime}>{showTime(e.create_time)}</p>*/}
                  {/*</div>*/}
                </Row>
              </div>
            </Card>)}
        </div>}
        {this.state.pOrR === 'request' && <div className={styles.requestList}>
          {this.state.objects.map(e =>
            <Card noHovering={true} key={e._id} bordered={true}>
              <div>
                <Row>
                  <Col span={3}>
                    <div className={styles.starAnswerDiv}
                         onClick={() => this.toUserRequestDetail(e._id, history)}>
                      <div className={styles.starDiv}>
                        {e.accept_answer ? <p className={styles.starNumber}>
                          <Icon style={{'color': '#439A46', 'fontSize': '18px'}}
                                type="check-circle"/></p> : <p
                          className={styles.starNumber}>{e['answer_number']}</p>}
                        <p className={styles.starText}
                           style={e.accept_answer ? {'color': '#439A46'} : null}>Answer</p>
                      </div>
                      <div className={styles.starDiv}>
                        <p
                          className={styles.starNumber}>{e['star_user'].length}</p>
                        <p className={styles.starText}>Star</p>
                      </div>
                    </div>
                  </Col>
                  <Col span={21}>
                    <div className={styles.rightArea}>
                      <p className={styles.title}
                         onClick={() => this.toUserRequestDetail(e._id, history)}>{e.title}</p>
                      {/*<p className={styles.description}>{e.description}</p>*/}
                      <div className={styles.footer}>
                        <Icon type="user" className={styles.firstIcon}/>
                        <p>{e.user_ID} </p>
                        <Icon type="tags" className={styles.otherIcon}/>
                        {e['tags'].length > 0 &&
                        <p key={e}>{e['tags'].join(',')}</p>}
                        <Icon type="clock-circle-o"
                              className={styles.otherIcon}/>
                        <p>{showTime(e.create_time)}</p>
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>
            </Card>)}
        </div>}

        <div className={styles.pagination}>
          <Pagination showSizeChanger
                      onShowSizeChange={this.onShowSizeChange.bind(this)}
                      onChange={this.onShowSizeChange}
                      defaultCurrent={1}
                      defaultPageSize={this.state.pageSize}
                      pageSizeOptions={['5', '10', '15', '20', '25']}
                      total={this.state.totalNumber}/>
        </div>

      </div>
    )
  }
}

class MyRequestList extends Component {
  constructor() {
    super()
    this.state = {
      requests: [],
      totalNumber: 0,
      requestsLoading: false,
      pageNo: 1,
      pageSize: 10,
      type: 'all',
    }
  }

  fetchData({payload}) {
    if (payload) {
      payload['type'] = this.state.type
    }
    else {
      payload = {'type': this.state.type}
    }
    payload['page_no'] = this.state.pageNo
    payload['page_size'] = this.state.pageSize
    payload['group'] = 'my'
    payload['user_ID'] = this.props.user_ID

    fetchAllUserRequest({
      payload,
      onJson: ({user_request: requests, total_number: totalNumber}) => {
        this.setState({
          requests, totalNumber
        })
      }
    })
  }

  componentDidMount() {
    this.fetchData({
      payload: {}
    })
  }

  handleQueryChange(value) {
    this.fetchData({
      payload: {
        search_query: value,
      }
    })
  }

  toUserRequestDetail(id, history) {
    history.push(`/userrequest/${id}`)
  }

  onShowSizeChange = (current, pageSize) => {
    this.setState({
      pageNo: current,
      pageSize: pageSize
    }, () => this.fetchData({payload: {}}))

  }

  typeChange = (e) => {
    console.log('radio checked', e.target.value)
    this.setState({
      type: e.target.value,
      pageNo: 1,
    }, () => this.fetchData({}))

  }

  render() {
    const {history, user_ID} = this.props
    return (
      <div className={styles.bottomRow}>
        <div className={styles.radioGroupDiv}>
          <RadioGroup onChange={this.typeChange} value={this.state.type}>
            <Radio value={'all'} className={styles.radio}>All</Radio>
            <Radio value={'app'} className={styles.radio}>App</Radio>
            <Radio value={'module'} className={styles.radio}>Module</Radio>
            <Radio value={'dataset'} className={styles.radio}>Dataset</Radio>
          </RadioGroup>
          <Search className={styles.search}
                  placeholder="input search text"
                  onSearch={(value) => this.handleQueryChange(value)}
                  style={{width: 200}}
          />
        </div>
        <div className={styles.requestList}>
          {this.state.requests.map(e =>
            <Card noHovering={true} key={e._id} bordered={true}>
              <div>
                <Row>
                  <Col span={3}>
                    <div className={styles.starAnswerDiv}
                         onClick={() => this.toUserRequestDetail(e._id, history)}>
                      <div className={styles.starDiv}>
                        {e.accept_answer ? <p className={styles.starNumber}>
                          <Icon style={{'color': '#439A46', 'fontSize': '18px'}}
                                type="check-circle"/></p> : <p
                          className={styles.starNumber}>{e['answer_number']}</p>}
                        <p className={styles.starText}
                           style={e.accept_answer ? {'color': '#439A46'} : null}>Answer</p>
                      </div>
                      <div className={styles.starDiv}>
                        <p
                          className={styles.starNumber}>{e['star_user'].length}</p>
                        <p className={styles.starText}>Star</p>
                      </div>

                    </div>
                  </Col>
                  <Col span={21}>
                    <div className={styles.rightArea}>
                      <p className={styles.title}
                         onClick={() => this.toUserRequestDetail(e._id, history)}>{e.title}</p>
                      {/*<p className={styles.description}>{e.description}</p>*/}
                      <div className={styles.footer}>
                        <Icon type="tags" className={styles.firstIcon}/>
                        {e['tags'].length > 0 &&
                        <p key={e}>{e['tags'].join(',')}</p>}
                        <Icon type="clock-circle-o"
                              className={styles.otherIcon}/>
                        <p>{showTime(e.create_time)}</p>
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>
            </Card>)}
          <div className={styles.pagination}>
            <Pagination showSizeChanger
                        onShowSizeChange={this.onShowSizeChange.bind(this)}
                        onChange={this.onShowSizeChange}
                        defaultCurrent={1}
                        defaultPageSize={this.state.pageSize}
                        pageSizeOptions={['5', '10', '15', '20', '25']}
                        total={this.state.totalNumber}/>
          </div>
        </div>
      </div>
    )
  }
}

class MyAnswerList extends Component {
  constructor() {
    super()
    this.state = {
      requests: [],
      totalNumber: 0,
      requestsLoading: false,
      pageNo: 1,
      pageSize: 10,
      type: 'all',
    }
  }

  fetchData({payload}) {
    if (payload) {
      payload['type'] = this.state.type
    }
    else {
      payload = {'type': this.state.type}
    }
    payload['page_no'] = this.state.pageNo
    payload['page_size'] = this.state.pageSize
    payload['user_ID'] = this.props.user_ID

    fetchUserRequestAnswerByUserID({
      payload,
      onJson: ({request_answer_info: requests, total_number: totalNumber}) => {
        console.log(requests)
        this.setState({
          requests, totalNumber
        })
      }
    })
  }

  componentDidMount() {
    this.fetchData({
      payload: {}
    })
  }

  handleQueryChange(value) {
    this.fetchData({
      payload: {
        search_query: value,
      }
    })
  }

  toUserRequestDetail(id, history) {
    history.push(`/userrequest/${id}`)
  }

  onShowSizeChange = (current, pageSize) => {
    this.setState({
      pageNo: current,
      pageSize: pageSize
    }, () => this.fetchData({payload: {}}))

  }

  typeChange = (e) => {
    console.log('radio checked', e.target.value)
    this.setState({
      type: e.target.value,
      pageNo: 1,
    }, () => this.fetchData({}))

  }

  render() {
    const {history, user_ID} = this.props
    return (
      <div className={styles.bottomRow}>
        <div className={styles.radioGroupDiv}>
          <RadioGroup onChange={this.typeChange} value={this.state.type}>
            <Radio value={'all'} className={styles.radio}>All</Radio>
            <Radio value={'app'} className={styles.radio}>App</Radio>
            <Radio value={'module'} className={styles.radio}>Module</Radio>
            <Radio value={'dataset'} className={styles.radio}>Dataset</Radio>
          </RadioGroup>
          <Search className={styles.search}
                  placeholder="input search text"
                  onSearch={(value) => this.handleQueryChange(value)}
                  style={{width: 200}}
          />
        </div>
        <div className={styles.requestList}>
          {this.state.requests.map(e =>
            <Card noHovering={true} key={e._id} bordered={true}>
              <div>
                <Row>
                  <Col span={21}>
                    <div className={styles.rightArea}>
                      <p className={styles.title}
                         onClick={() => this.toUserRequestDetail(e.user_request, history)}>{e.user_request_title}</p>
                      <p className={styles.description}>{e.answer}</p>
                      <div className={styles.footer}>
                        <Icon type="clock-circle-o"
                              className={styles.firstIcon}/>
                        <p>{showTime(e.create_time)}</p>
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>
            </Card>)}
          <div className={styles.pagination}>
            <Pagination showSizeChanger
                        onShowSizeChange={this.onShowSizeChange.bind(this)}
                        onChange={this.onShowSizeChange}
                        defaultCurrent={1}
                        defaultPageSize={this.state.pageSize}
                        pageSizeOptions={['5', '10', '15', '20', '25']}
                        total={this.state.totalNumber}/>
          </div>
        </div>
      </div>
    )
  }
}


export default connect(({login, allRequest, profile}) => ({
  login,
  allRequest,
  profile
}))(Profile)
