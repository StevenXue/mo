import React, { Component } from 'react'
import {connect} from 'dva'
import {Card, Tabs, Icon, Radio, Row, Col, Input,Pagination } from 'antd'

const TabPane = Tabs.TabPane
const {Meta} = Card
const Search = Input.Search

import styles from './index.less'
import {fetchAllUserRequest} from "../../services/userRequest"
import {showTime} from "../../utils"

const RadioGroup = Radio.Group;

function callback(key) {
  console.log(key)
}


function Profile({login, module, dispatch}) {
  if (login.user) {
    const {age, email, name, phone, user_ID} = login.user
    return (
      <div className={`main-container ${styles.normal}`}>
        <div className={styles.info}>
          {/*info head*/}
          <div className={styles.name}>
            <Icon type="user" style={{fontSize: 56, color: '#08c',}}/>
            <h1>
              {user_ID}&nbsp;
              <span className={styles.rightButton}>
                  {/*<ProjectModel new={false} projectDetail={projectDetail}*/}
                {/*>*/}
                {/*<Button icon='edit' style={{marginRight: 15}}/>*/}
                {/*</ProjectModel>*/}
                </span>
            </h1>
            <div>
              <p>App</p><p>Module</p><p>Dataset</p>
            </div>
          </div>
        </div>
        <Tabs defaultActiveKey="1" onChange={callback}
              className={styles.jobs}>
          <TabPane tab="Favourite" key="1">
            Some Description
            <br/>
            Some Description
            <br/>
            Some Description
          </TabPane>
          <TabPane tab="My request" key="2">
            <MyRequestList/>
          </TabPane>

          <TabPane tab="My answer" key="3">
            <App />
          </TabPane>
        </Tabs>

      </div>
    )
  }
  else {
    return <div/>
  }
}

class App extends React.Component {
  state = {
    key: 3,
  }
  onChange = (e) => {
    console.log('radio checked', e.target.value);
    this.setState({
      key: e.target.value,
    });
  }
  render() {
    return (
      <RadioGroup onChange={this.onChange} value={this.state.key}>
        <Radio value={'A'}>A</Radio>
        <Radio value={'B'}>B</Radio>
        <Radio value={3}>C</Radio>
        <Radio value={4}>D</Radio>
      </RadioGroup>
    );
  }
}

class MyFavourList extends Component {
  constructor() {
    super()
    this.state = {
      requests: [],
      totalNumber: 0,
      requestsLoading: false,
      pageNo: 1,
      pageSize: 10,
      type:'all',
    }
  }

  fetchData({payload}) {
    if (payload) {
      payload['type'] = this.state.type
    }
    else {
      payload = {'type': this.state.type}
    }
    payload['page_no']=this.state.current
    payload['page_size']=this.state.pageSize
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
      payload: {
      }
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
    },() => this.fetchData({payload: {}}))

  }

  typeChange = (e) => {
    console.log('radio checked', e.target.value)
    this.setState({
      type: e.target.value,
      pageNo: 1,
    },() => this.fetchData({}))

  }

  render() {
    const {history, project, dispatch} = this.props
    return (
      <div>
        <div>
          <RadioGroup onChange={this.typeChange} value={this.state.value}>
            <Radio value={'all'}>All</Radio>
            <Radio value={'app'}>App</Radio>
            <Radio value={'module'}>Module</Radio>
            <Radio value={'dataset'}>Dataset</Radio>
          </RadioGroup>
        </div>
        <div className={styles.header}>
          <Search
            placeholder="input search text"
            onSearch={(value) => this.handleQueryChange(value)}
            style={{width: 200}}
          />
        </div>
        <div className={styles.requestList}>
          {this.state.requests.map(e =>
            <Card key={e._id} className={styles.card}>
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

class MyAnswerList extends Component {
  constructor() {
    super()
    this.state = {
      requests: [],
      totalNumber: 0,
      requestsLoading: false,
      pageNo: 1,
      pageSize: 10,
      type:'all',
    }
  }

  fetchData({payload}) {
    if (payload) {
      payload['type'] = this.state.type
    }
    else {
      payload = {'type': this.state.type}
    }
    payload['page_no']=this.state.current
    payload['page_size']=this.state.pageSize
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
      payload: {
      }
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
    },() => this.fetchData({payload: {}}))

  }

  typeChange = (e) => {
    console.log('radio checked', e.target.value)
    this.setState({
      type: e.target.value,
      pageNo: 1,
    },() => this.fetchData({}))

  }

  render() {
    const {history, project, dispatch} = this.props
    return (
      <div>
        <div>
          <RadioGroup onChange={this.typeChange} value={this.state.value}>
            <Radio value={'all'}>All</Radio>
            <Radio value={'app'}>App</Radio>
            <Radio value={'module'}>Module</Radio>
            <Radio value={'dataset'}>Dataset</Radio>
          </RadioGroup>
        </div>
        <div className={styles.header}>
          <Search
            placeholder="input search text"
            onSearch={(value) => this.handleQueryChange(value)}
            style={{width: 200}}
          />
        </div>
        <div className={styles.requestList}>
          {this.state.requests.map(e =>
            <Card key={e._id} className={styles.card}>
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
      type:'all',
    }
  }

  fetchData({payload}) {
    if (payload) {
      payload['type'] = this.state.type
    }
    else {
      payload = {'type': this.state.type}
    }
    payload['page_no']=this.state.current
    payload['page_size']=this.state.pageSize
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
      payload: {
      }
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
    },() => this.fetchData({payload: {}}))

  }

  typeChange = (e) => {
    console.log('radio checked', e.target.value)
    this.setState({
      type: e.target.value,
      pageNo: 1,
    },() => this.fetchData({}))

  }

  render() {
    const {history, project, dispatch} = this.props
    return (
      <div>
        <div>
          <RadioGroup onChange={this.typeChange} value={this.state.type}>
            <Radio value={'all'}>All</Radio>
            <Radio value={'app'}>App</Radio>
            <Radio value={'module'}>Module</Radio>
            <Radio value={'dataset'}>Dataset</Radio>
          </RadioGroup>
        </div>
        <div className={styles.header}>
          <Search
            placeholder="input search text"
            onSearch={(value) => this.handleQueryChange(value)}
            style={{width: 200}}
          />
        </div>
        <div className={styles.requestList}>
          {this.state.requests.map(e =>
            <Card key={e._id} className={styles.card}>
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

export default connect(( {login,allRequest}) =>({login, allRequest})) (Profile)
