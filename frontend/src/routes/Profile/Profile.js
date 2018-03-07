import React, {Component} from 'react'
import {connect} from 'dva'
import {Card, Tabs, Icon, Radio, Row, Col, Input, Pagination} from 'antd'

const TabPane = Tabs.TabPane
const {Meta} = Card
const Search = Input.Search

import styles from './index.less'
import {fetchAllUserRequest} from "../../services/userRequest"
import {showTime} from "../../utils"

const RadioGroup = Radio.Group

function callback(key) {
  console.log(key)
}


function Profile({login, dispatch, history}) {
  if (login.user) {
    const {age, email, name, phone, user_ID} = login.user
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
              <div >
                <div className={styles.name}>
                  {user_ID}
                </div>
                <div>
                  <Row type="flex" justify="start">
                    <Col span={2}>
                      <div className={styles.appDiv}>
                        <p className={styles.appText}>App</p>
                        <p className={styles.appNumber}>3</p>
                      </div>
                    </Col>
                    <Col span={1}>
                      <div className={styles.appDiv}>
                        <div className={styles.appDivider} />
                      </div>
                    </Col>
                    <Col span={2}>
                      <div className={styles.appDiv}>
                        <p className={styles.appText}>Module</p>
                        <p className={styles.appNumber}>1</p>
                      </div>
                    </Col>
                    <Col span={1}>
                      <div className={styles.appDiv}>
                        <div className={styles.appDivider} />
                      </div>
                    </Col>
                    <Col span={2}>
                      <div className={styles.appDiv}>
                        <p className={styles.appText}>Dataset</p>
                        <p className={styles.appNumber}>12</p>
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
            <TabPane tab="Favourite" key="1" >
              <MyFavouriteList history={history}/>
            </TabPane>
            <TabPane tab="My request" key="2">
              <MyRequestList history={history}/>
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
    const {history, project, dispatch} = this.props
    return (
      <div className={styles.bottomRow}>
        <div className={styles.radioGroupDiv}>
          <RadioGroup onChange={this.typeChange} value={this.state.type}>
            <Radio value={'app'} className={styles.radio}>App</Radio>
            <Radio value={'module'} className={styles.radio}>Module</Radio>
            <Radio value={'dataset'} className={styles.radio}>Dataset</Radio>
            <Radio value={'request'} className={styles.radio}>Request</Radio>
          </RadioGroup>
          <Search className={styles.search}
                  placeholder="input search text"
                  onSearch={(value) => this.handleQueryChange(value)}
                  style={{width: 200}}
          />
        </div>
        <div className={styles.requestList}>
          {this.state.requests.map(e =>
            <Card noHovering={true} key={e._id}  bordered={false} >
              <div>
                <Row>
                  <Col span={3}>
                    <div
                      onClick={() => this.toUserRequestDetail(e._id, history)}>
                      <div className={styles.starDiv}>
                        <p
                          className={styles.starNumber}>{e['star_user'].length}</p>
                        <p className={styles.starText}>Star</p>
                      </div>
                      <div className={styles.starDiv}>
                        <p
                          className={styles.starNumber}>{e['answer_number']}</p>
                        <p className={styles.starText}>Answer</p>
                      </div>
                    </div>
                  </Col>
                  <Col span={21}>
                    <div>
                      <p className={styles.title}
                         onClick={() => this.toUserRequestDetail(e._id, history)}>{e.title}</p>
                      {/*<p className={styles.description}>{e.description}</p>*/}
                      <div>
                        {e['tags'].length > 0 && e['tags'].map(e => <p key={e}
                                                                       className={styles.tags}>{e}</p>)}
                        <div className={styles.timeAndUserDiv}>
                          <p
                            className={styles.showTime}>{showTime(e.create_time)}</p>
                          <p className={styles.showTime}>&nbsp;&nbsp; asked
                            at &nbsp;&nbsp;</p>
                          <p className={styles.showTime}>{e.user_ID} </p>
                        </div>
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
    const {history, project, dispatch} = this.props
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
            <Card noHovering={true} key={e._id}  bordered={false} >
              <div>
                <Row>
                  <Col span={3}>
                    <div
                      onClick={() => this.toUserRequestDetail(e._id, history)}>
                      <div className={styles.starDiv}>
                        <p
                          className={styles.starNumber}>{e['star_user'].length}</p>
                        <p className={styles.starText}>Star</p>
                      </div>
                      <div className={styles.starDiv}>
                        <p
                          className={styles.starNumber}>{e['answer_number']}</p>
                        <p className={styles.starText}>Answer</p>
                      </div>
                    </div>
                  </Col>
                  <Col span={21}>
                    <div>
                      <p className={styles.title}
                         onClick={() => this.toUserRequestDetail(e._id, history)}>{e.title}</p>
                      {/*<p className={styles.description}>{e.description}</p>*/}
                      <div>
                        {e['tags'].length > 0 && e['tags'].map(e => <p key={e}
                                                                       className={styles.tags}>{e}</p>)}
                        <div className={styles.timeAndUserDiv}>
                          <p
                            className={styles.showTime}>{showTime(e.create_time)}</p>
                          <p className={styles.showTime}>&nbsp;&nbsp; asked
                            at &nbsp;&nbsp;</p>
                          <p className={styles.showTime}>{e.user_ID} </p>
                        </div>
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

export default connect(({login, allRequest}) => ({login, allRequest}))(Profile)
