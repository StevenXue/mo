import React, {Component} from 'react'
import {connect} from 'dva'
import {Card, Tabs, Icon, Radio, Row, Col, Input, Pagination} from 'antd'

const TabPane = Tabs.TabPane
const {Meta} = Card
const Search = Input.Search

import styles from './index.less'
import {fetchAllUserRequest} from "../../services/userRequest"
import {get_star_favor} from "../../services/user"
import {fetchUserRequestAnswerByUserID} from "../../services/userRequestAnwser"
import {showTime} from "../../utils"
import {routerRedux} from "dva/router"

const RadioGroup = Radio.Group

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
    const {age, email, name, phone, user_ID} = profile.userInfo
    const {projectNumber} = profile
    return (
      <div className={`main-container ${styles.container}`}>
        <div className={styles.headerRow}>
          <Row>
            <Col span={3} style={{padding: '0 0 0 50px'}}>
              <div className={styles.photoDiv}>
                <p className={styles.photoP}>
                  <Icon type="user" style={{fontSize: 100, color: '#08c',}}/>
                </p>
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
                           onClick={() => toWorkspace(dispatch, 'App')}>
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
                           onClick={() => toWorkspace(dispatch, 'Module')}>
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
                           onClick={() => toWorkspace(dispatch, 'Dataset')}>
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
      requests: [],
      objects: [],
      totalNumber: 0,
      pageNo: 1,
      pageSize: 10,
      action_entity: 'favor_apps',
    }
  }

  fetchData({payload}) {
    if (payload) {
      payload['action_entity'] = this.state.action_entity
    }
    else {
      payload = {'action_entity': this.state.action_entity}
    }
    payload['page_no'] = this.state.current
    payload['page_size'] = this.state.pageSize
    payload['group'] = 'my'
    payload['user_ID'] = this.props.user_ID

    get_star_favor({
      payload,
      onJson: ({objects: objects, count: totalNumber}) => {
        this.setState({
          objects, totalNumber
        })
      }
    })
  }

  fetchProject({payload}) {
    if (payload) {
      payload['action_entity'] = this.state.action_entity
    }
    else {
      payload = {'action_entity': this.state.action_entity}
    }
    payload['page_no'] = this.state.current
    payload['page_size'] = this.state.pageSize
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
    history.push(`/market/${id}`)
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
      action_entity: e.target.value,
      pageNo: 1,
    }, () => this.fetchData({}))
  }

  render() {
    const {history, project, dispatch} = this.props
    return (
      <div className={styles.bottomRow}>
        <div className={styles.radioGroupDiv}>
          <RadioGroup onChange={this.typeChange}
                      value={this.state.action_entity}>
            <Radio value={'favor_apps'} className={styles.radio}>App</Radio>
            <Radio value={'favor_modules'}
                   className={styles.radio}>Module</Radio>
            <Radio value={'favor_datasets'}
                   className={styles.radio}>Dataset</Radio>
            <Radio value={'request'} className={styles.radio}>Request</Radio>
          </RadioGroup>
          <Search className={styles.search}
                  placeholder="input search text"
                  onSearch={(value) => this.handleQueryChange(value)}
                  style={{width: 200}}
          />
        </div>
        <div className={styles.favorList}>
          {this.state.objects.map(e =>
            <Card noHovering={true} key={e._id} bordered={false}>
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
                        <Icon type="user" className={styles.userIcon}/>
                        <p>{e.user_ID} </p>
                        <Icon type="tags" className={styles.tagsIcon}/>
                        <p>{e.tags}</p>
                        <Icon type="clock-circle-o"
                              className={styles.tagsIcon}/>
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
    payload['page_no'] = this.state.current
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
            <Card noHovering={true} key={e._id} bordered={false}>
              <div>
                <Row>
                  <Col span={3}>
                    <div className={styles.starAnswerDiv}
                         onClick={() => this.toUserRequestDetail(e._id, history)}>
                      <div className={styles.starDiv}>
                        {e.accept_answer ? <p className={styles.starNumber}>
                          <Icon style={{'color':'#439A46', 'fontSize':'18px'}} type="check-circle"/></p> : <p
                          className={styles.starNumber} >{e['answer_number']}</p>}
                        <p className={styles.starText}  style={e.accept_answer ?{'color':'#439A46' }:null}>Answer</p>
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
                        <Icon type="tags" className={styles.tagsIcon}/>
                        {e['tags'].length > 0 &&
                        <p key={e}>{e['tags'].join(',')}</p>}
                        <Icon type="clock-circle-o"
                              className={styles.clockIcon}/>
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
    payload['page_no'] = this.state.current
    payload['page_size'] = this.state.pageSize
    payload['user_ID'] = this.props.user_ID

    fetchUserRequestAnswerByUserID({
      payload,
      onJson: ({request_answer_info: requests, total_number: totalNumber}) => {
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
            <Card noHovering={true} key={e._id} bordered={false}>
              <div>
                <Row>
                  <Col span={3}>
                    <div className={styles.starAnswerDiv}
                         onClick={() => this.toUserRequestDetail(e._id, history)}>
                      <div className={styles.starDiv}>
                        {e.accept_answer ? <p className={styles.starNumber}>
                          <Icon style={{'color':'#439A46', 'fontSize':'18px'}} type="check-circle"/></p> : <p
                          className={styles.starNumber} >{e['answer_number']}</p>}
                        <p className={styles.starText}  style={e.accept_answer ?{'color':'#439A46' }:null}>Answer</p>
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
                        <Icon type="tags" className={styles.tagsIcon}/>
                        {e['tags'].length > 0 &&
                        <p key={e}>{e['tags'].join(',')}</p>}
                        <Icon type="clock-circle-o"
                              className={styles.clockIcon}/>
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
