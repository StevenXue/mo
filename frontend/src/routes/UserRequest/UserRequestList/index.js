import React, {Component} from 'react'
import {connect} from 'dva'
import {
  Select,
  Card,
  Input,
  Icon,
  Button,
  Row,
  Col,
  Pagination,
  Tabs
} from 'antd'
import {showTime} from '../../../utils/index'
import {arrayToJson, JsonToArray} from '../../../utils/JsonUtils'
import {routerRedux} from 'dva/router'
import RequestModal from '../../../components/RequestModal/index'

import styles from './index.less'
import {fetchAllUserRequest} from "../../../services/userRequest"

const Option = Select.Option
const Search = Input.Search
const TabPane = Tabs.TabPane

const related_fields = ['All',
  'Business', 'Government', 'Education', 'Environment',
  'Health', 'Housing & Development', 'Public Services',
  'Social', 'Transportation', 'Science', 'Technology']


function AllRequest({history, allRequest, dispatch,location}) {
  const defaultActiveKeyDic = {"?tab=App":"1","?tab=Module":"2","?tab=Dataset":"3"}
  const paramList = Object.keys(defaultActiveKeyDic)

  function callback(key) {
    history.push(`userrequest${paramList[parseInt(key)-1]}`)
  }

  return (
    <div className={`main-container ${styles.normal}`}>
      <Tabs defaultActiveKey={defaultActiveKeyDic[location.search]} onChange={callback}>
        <TabPane tab="Apps" key="1">
          <RequestList {...{history, allRequest, dispatch}} type='app'/>
        </TabPane>
        <TabPane tab="Modules" key="2">
          <RequestList {...{history, allRequest, dispatch}} type='module'/>
        </TabPane>
        <TabPane tab="Datasets" key="3">
          <RequestList {...{history, allRequest, dispatch}} type='dataset'/>
        </TabPane>
      </Tabs>
    </div>
  )
}


class RequestList extends Component {
  constructor() {
    super()
    this.state = {
      requests: [],
      totalNumber: 0,
      requestsLoading: false,
      requestType: 'project',
      pageNo: 1,
      pageSize: 10,
    }
  }

  fetchData({payload}) {
    const {type} = this.props
    if (payload) {
      payload['type'] = type
    }
    else {
      payload = {'type': type}
    }
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
        page_no: this.state.current,
        page_size: this.state.pageSize,
      }
    })
  }

  handleQueryChange(value) {
    this.fetchData({
      payload: {
        search_query: value,
        page_no: this.state.current,
        page_size: this.state.pageSize,
      }
    })
  }

  toUserRequestDetail(id, history) {
    history.push(`/userrequest/${id}`)
  }


  toUserProfile(user_ID, history) {
    history.push(`/profile/${user_ID}`)
  }

  onShowSizeChange = (current, pageSize) => {
    this.setState({
      pageNo: current,
      pageSize: pageSize
    })
    this.fetchData({payload: {page_no: current, page_size: pageSize,}})
  }

  render() {
    const {history, project, dispatch} = this.props
    return (
      <div>
        <div className={styles.header}>
          <Search
            placeholder="input search text"
            onSearch={(value) => this.handleQueryChange(value)}
            style={{width: 200}}
          />
          <RequestModal new={true} fetchData={() => this.fetchData({})}
                        type={this.props.type}>
            <Button icon='plus-circle-o' type='primary'
                    className={styles.rightButton}>New {this.props.type} Request</Button>
          </RequestModal>
        </div>
        <div className={styles.requestList}>
          {this.state.requests.map(e =>
            <Card key={e._id} className={styles.card}
                  bodyStyle={{paddingLeft:0}}>
              <div>
                <Row gutter={5} type="flex" justify="space-around" align="middle">
                  <Col span={3} >
                    <div className={styles.starAnswerDiv}
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
                          <p className={styles.user_ID}
                             onClick={() => this.toUserProfile(e.user_ID, history)}>{e.user_ID} </p>
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
                        defaultPageSize={this.props.allRequest.pageSize}
                        pageSizeOptions={['5', '10', '15', '20', '25']}
                        total={this.state.totalNumber}/>
          </div>
        </div>
      </div>
    )
  }
}

export default connect(({allRequest}) => ({allRequest}))(AllRequest)
