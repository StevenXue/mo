import React, { Component } from 'react'
import { connect } from 'dva'
import {
  Select,
  Card,
  Input,
  Icon,
  Button,
  Row,
  Col,
  Pagination,
  Tabs,
  Tag,
  Spin,
} from 'antd'
import { showTime } from '../../../utils/index'
import { arrayToJson, JsonToArray } from '../../../utils/JsonUtils'
import { routerRedux } from 'dva/router'
import RequestModal from '../../../components/RequestModal/index'
import TagSelect from '../../../components/TagSelect/index'

import styles from './index.less'
import { fetchAllUserRequest,getHotTagOfRequest } from '../../../services/userRequest'

const Option = Select.Option
const Search = Input.Search
const TabPane = Tabs.TabPane

const related_fields = ['All',
  'Business', 'Government', 'Education', 'Environment',
  'Health', 'Housing & Development', 'Public Services',
  'Social', 'Transportation', 'Science', 'Technology']

function AllRequest({ history, allRequest, dispatch, location }) {
  const defaultActiveKeyDic = { '?tab=app': '1', '?tab=module': '2', '?tab=dataset': '3' }
  const paramList = Object.keys(defaultActiveKeyDic)

  function callback(key) {
    history.push(`userrequest${paramList[parseInt(key) - 1]}`)
  }

  return (
    <div className={`main-container ${styles.normal}`}>
      <Tabs defaultActiveKey={defaultActiveKeyDic[location.search]} onChange={callback}>
        <TabPane tab="Apps" key="1">
          <RequestList {...{ history, allRequest, dispatch, location}} type='app'/>
        </TabPane>
        <TabPane tab="Modules" key="2">
          <RequestList {...{ history, allRequest, dispatch, location}} type='module'/>
        </TabPane>
        <TabPane tab="Datasets" key="3">
          <RequestList {...{ history, allRequest, dispatch, location}} type='dataset'/>
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
      search_query: null,
      loading:true
    }
  }

  fetchData({ payload }) {
    const { type } = this.props
    this.setState({
      loading: true,
    })
    if (payload) {
      payload['type'] = type
    }
    else {
      payload = { 'type': type }
    }
    fetchAllUserRequest({
      payload,
      onJson: ({ user_request: requests, total_number: totalNumber }) => {
        this.setState({
          requests, totalNumber,
          loading:false
        })
      },
    })
  }

  componentDidMount() {
    localStorage.getItem('mei_1')==='ok'?document.getElementById('mei_rightButton').click():null
    localStorage.setItem('mei_1','no')
    this.fetchData({
      payload: {
        page_no: this.state.current,
        page_size: this.state.pageSize,
      },
    })
    // .then(res=>{
    //   this.props.location.search.indexOf('from')==-1?document.getElementById('mei_rightButton').click():null
    // })
    
    // this.hideBreadcrumb()
  }

  // hideBreadcrumb = ()=>{
  //   const {location} = this.props
  //   // console.log(document.getElementsByTagName('a') instanceof Array);  //false
  //   if(location.pathname==='/userrequest'){
  //     let array = Array.from(document.getElementsByTagName('a'))
  //     array.map((e,i)=>{
  //       e.text==='User Request'?document.getElementsByTagName('a')[i].style.color ='transparent':null
  //     })
  //   }
  // }

  handleQueryChange(value,tags) {
    this.setState({
      search_query: value,
    })
    this.fetchData({
      payload: {
        search_query: value,
        page_no: this.state.current,
        page_size: this.state.pageSize,
        search_tags:tags,
      },
    })
  }

  toUserRequestDetail(id, history) {
    const { type } = this.props
    history.push(`/userrequest/${id}?type=${type}`)
  }

  toUserProfile(user_ID, history) {
    history.push(`/profile/${user_ID}`)
  }

  onShowSizeChange = (current, pageSize) => {
    this.setState({
      pageNo: current,
      pageSize: pageSize,
    })
    this.fetchData({ payload: { search_query: this.state.search_query, page_no: current, page_size: pageSize } })
  }

  render() {
    const { history, project, dispatch } = this.props
    return (
      <div>
        <div className={styles.header}>
          <TagSelect getHotTag={getHotTagOfRequest} onSearch={(value,tags) => {
            this.handleQueryChange(value,tags)}} type={this.props.type}/>
          <RequestModal new={true} fetchData={() => this.fetchData({})}
                        type={this.props.type} >
            <Button icon='plus-circle-o' type='primary' id="mei_rightButton"
                    className={styles.rightButton}>New {this.props.type} Request</Button>
          </RequestModal>
        </div>
        <Spin spinning={this.state.loading}>
        <div className={styles.requestList}>
          {this.state.requests.map(e =>
            <Card key={e._id} className={styles.card}
                  bodyStyle={{ padding: '24px 32px' }}
            >
              <div>
                <Row gutter={16} type="flex" justify="space-around" align="middle">
                  <Col span={4}>
                    <div className={styles.starAnswerDiv}
                         onClick={() => this.toUserRequestDetail(e._id, history)}>
                      <div className={styles.starDiv}>
                        <p
                          className={styles.starNumber}>{e['star_user'].length}</p>
                        <p className={styles.starText}>Favourite</p>
                      </div>
                      <div className={styles.starDiv}>
                        <p
                          className={styles.starNumber}>{e['answer_number']}</p>
                        <p className={styles.starText}>Answer</p>
                      </div>
                    </div>
                  </Col>
                  <Col span={20}>
                    <div>
                      <p className={styles.title}
                         onClick={() => this.toUserRequestDetail(e._id, history)}>{e.title}</p>
                      {/*<p className={styles.description}>{e.description}</p>*/}
                      {/*<div>*/}
                      {/*{e['tags'].length > 0 && e['tags'].map(e => <Tag*/}
                      {/*className={styles.tags}*/}
                      {/*key={e}>{e}</Tag>)}*/}
                      {/*<div className={styles.timeAndUserDiv}>*/}
                      {/*<p className={styles.user_ID}*/}
                      {/*onClick={() => this.toUserProfile(e.user_ID, history)}>{e.user_ID} &nbsp;&nbsp;</p>*/}
                      {/*<p*/}
                      {/*className={styles.showTime}>{showTime(e.create_time)}</p>*/}
                      {/*</div>*/}
                      {/*</div>*/}
                      <div className={styles.footer}>
                        <Icon type="user" className={styles.firstIcon}/>
                        <p className={styles.user_ID}
                           onClick={() => this.toUserProfile(e.user_ID, history)}>{e.user_ID} &nbsp;&nbsp;</p>
                        {e['tags'].length > 0 && <Icon type="tags" className={styles.otherIcon}/>}
                        {e['tags'].length > 0 &&
                        <p key={e} style={{marginBottom:'0'}}>{e['tags'].join(',')}</p>}
                        <Icon type="clock-circle-o"
                              className={styles.otherIcon}/>
                        <p style={{marginBottom:'0'}}>{showTime(e.create_time)}</p>
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
        </Spin>
      </div>
    )
  }
}

export default connect(({ allRequest }) => ({ allRequest }))(AllRequest)
