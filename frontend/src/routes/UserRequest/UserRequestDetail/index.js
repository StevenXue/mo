import React from 'react'
import {connect} from 'dva'
import {routerRedux} from 'dva/router'
import styles from './index.less'
import {
  Tabs, Switch, Button, Input, Form, Card, Icon,
  Row, Col, Select, Spin, Modal, Tag, message as antdMessage
} from 'antd'
import debounce from 'lodash.debounce'
import {get} from 'lodash'
import {showTime} from '../../../utils/index'
import {JsonToArray} from '../../../utils/JsonUtils'
import RequestModal from '../../../components/RequestModal/index'
import {getProjects} from '../../../services/project'
import ProjectModal from '../../../components/ProjectModal/index'
import star from './img/star.png'
import star_o from './img/star-o.png'
import message from "../../../models/message"
import NotLogin from '../../../components/NotLogin/notLogin'


const {TextArea} = Input
const confirm = Modal.confirm
const FormItem = Form.Item

function hasErrors(fieldsError) {
  return Object.keys(fieldsError).some(field => fieldsError[field])
}

class CommentForm extends React.Component {

  componentDidMount() {
    // To disabled submit button at the beginning.
    this.props.form.validateFields()
    this.input.focus()
  }

  makeComment = (values) => {
    this.props.dispatch({
      type: 'allRequest/makeComment',
      payload: {
        comments: values['comment'],
        comments_type: this.props.comments_type,
        _id: this.props._id,
      },
    })
    if (this.props.comments_type === 'request') {
      showRequestCommentInput(this.props.dispatch, this.props.login)
    }
    else {
      showAnswerCommentInput(this.props.dispatch, this.props._id, this.props.login)
    }
  }

  handleSubmit = (e) => {
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      if (!err) {
        // console.log('Received values of form: ', values)
        this.makeComment(values)
      }

    })
  }

  onBlur = () => {
    if (this.props.comments_type === 'request') {
      showRequestCommentInput(this.props.dispatch, this.props.login)
    }
    if (this.props.comments_type === 'answer') {
      showAnswerCommentInput(this.props.dispatch, this.props._id, this.props.login)
    }
  }

  render() {
    const {getFieldDecorator, getFieldsError, getFieldError, isFieldTouched} = this.props.form
    // Only show error after a field is touched.
    const emptyCommentError = isFieldTouched('comment') && getFieldError('comment')
    return (
      <Form layout="inline"
            onBlur={() => this.onBlur()}
            onSubmit={this.handleSubmit}
      >
        <FormItem
          validateStatus={emptyCommentError ? 'error' : ''}
          help={emptyCommentError || ''}
        >
          {getFieldDecorator('comment', {
            rules: [{required: true, message: ''}, {
              validator: (rule, value, callback) => {
                if (value && value.length > 128) {
                  callback('comment is too long')
                }
                else {
                  callback()
                }
              },
            }],
          })(
            <Input className={styles.inputtext}
                   placeholder="Any idea to help?"
                   ref={inputRef => (this.input = inputRef)}
            />
          )}
        </FormItem>
        {/*<FormItem>*/}
        {/*<Button type="primary"*/}
        {/*htmlType="submit"*/}
        {/*disabled={hasErrors(getFieldsError())}*/}
        {/*onClick={this.handleSubmit}>*/}
        {/*确定*/}
        {/*</Button>*/}
        {/*</FormItem>*/}
      </Form>
    )
  }
}

class AnswerForm extends React.Component {

  constructor() {
    super()
    this.lastFetchId = 0
    this.fetchData = debounce(this.fetchData, 800)
  }

  state = {
    content: null,
    html: null,
    data: [],
    value: [],
    fetching: false,
    projects: [],
    selected: [],
    inputValue: '',
  }

  fetchData = (value) => {
    this.setState({
      fetching: true,
    })
    const {type} = this.props
    this.setState({projects: [], fetching: true, query: value})
    let filter = {'type': type, 'query': value}
    getProjects({
      filter,
      onJson: ({projects}) => this.setState({
        projects, fetching: false,
      }),
    })

  }

  handleSelectChange = (value) => {
    this.setState({
      value,
      data: [],
      fetching: false,
      selected: this.state.projects.filter(function (element) {
        return (element['_id'] == value.key)
      }),
    })
  }

  handleCreate = (project) => {
    this.setState({
      selected: project,
    })
  }

  clearSelect = () => {
    this.setState({
      value: [],
      data: [],
      fetching: false,
      selected: [],
    })
  }

  handleSubmit = () => {
    const {form} = this.props
    form.validateFields((err, values) => {
      if (!err) {
        let selectProjectID = null
        if (this.state.selected.length > 0) {
          selectProjectID = this.state.selected[0]['_id']
        }
        if (
          this.props.dispatch({
            type: 'allRequest/makeNewRequestAnswer',
            payload: {
              // answer: this.state.html,
              ...values,
              selectProject: selectProjectID,
            },
          })) {
          this.clearSelect()
          // this.setState({inputValue: ''})
          //清空输入框
          form.setFieldsValue({'answer': null})
        }
      }
    })
  }

  // handleChange = (content) => {
  //   // console.log(content)
  //   this.setState({
  //     content,
  //   })
  // }
  //
  // handleHTMLChange = (html) => {
  //   if (html === '<p></p>') {
  //     html = null
  //   }
  //   this.setState({
  //     html,
  //   })
  // }
  //
  // validateFn = (file) => {
  //   return file.size < 1024 * 100
  // }

  // handleInputChange(e) {
  //   this.setState({inputValue: e.target.value})
  // }

  render() {

    // const editorProps = {
    //   placeholder: 'More description about your answer more help',
    //   height: 200,
    //   language: 'en',
    //   initialContent: this.state.content,
    //   onChange: this.handleChange,
    //   onHTMLChange: this.handleHTMLChange,
    //   media: {
    //     image: true, // 开启图片插入功能
    //     video: false, // 关闭视频插入功能
    //     audio: false, // 关闭音频插入功能
    //     validateFn: this.validateFn, // 指定本地校验函数
    //     uploadFn: null, // 指定上传函数
    //   },
    // }
    const {fetching, data, value, projects, inputValue} = this.state
    // console.log(this.state)
    const {getFieldDecorator, getFieldsError, getFieldError, isFieldTouched} = this.props.form
    const answerError = !isFieldTouched('answer') || getFieldError('answer')
    return (
      <div className="demo" style={{marginBottom: '80px'}}>

        <Form layout='horizontal'>
          <FormItem>
            {
              getFieldDecorator('answer', {
                rules: [
                  {
                    required: true,
                  }, {
                    validator: (rule, value, callback) => {
                      if (value.length > 500) {
                        callback('answer is too long')
                      } else {
                        callback()
                      }
                    },
                  }
                ],
              })(<TextArea
                // value={inputValue}
                style={{width: '52%'}}
                placeholder="More description about your answer more help"
                autosize={{minRows: 5, maxRows: 50}}
                // onChange={(e) => this.handleInputChange(e)}
              />)
            }
          </FormItem>
        </Form>
        <div style={{margin: '24px 0'}}/>
        {this.state.selected.length > 0 ?
          <Card
            style={{width: '52%'}}
            title={this.state.selected[0].name}
            extra={<Icon type="close" onClick={this.clearSelect}/>}
          >
            <p>{this.state.selected[0].description}</p></Card> : null}
        {this.state.selected.length === 0 ? <div><Select
          mode="combobox"
          labelInValue
          value={value}
          placeholder={'Select ' + this.props.type}
          notFoundContent={fetching ? <Spin size="small"/> : null}
          filterOption={false}
          onSearch={this.fetchData.bind(this)}
          onChange={this.handleSelectChange}
          style={{width: '40%'}}
        >
          {projects.map(d => <Select.Option
            key={d._id}>{d.name}</Select.Option>)}
        </Select>
          <ProjectModal
            new={true}
            type={this.props.type}
            newAnswer={true}
            handleCreate={this.handleCreate}>
            <Button icon='plus-circle-o' type='primary'
                    style={{'marginLeft': '30px'}} >New {this.props.type}</Button>
          </ProjectModal></div> : null}
        {/*<BraftEditor {...editorProps}/>*/}
        <div style={{margin: '24px 0'}}/>

        <Button
          type="primary"
          htmlType="submit"
          disabled={answerError}
          onClick={this.handleSubmit}
        >
          Post Your Answer
        </Button>
      </div>
    )
  }
}

function callback(key) {
  console.log(key)
}

function showAnswerCommentInput(dispatch, request_answer_id, login) {
  if (login.user) {
    dispatch({
      type: 'allRequest/showAnswerCommentInput',
      payload: {
        request_answer_id: request_answer_id,
      },
    })
  }
  else {
    antdMessage.warning('Please login')
    dispatch(routerRedux.push('/user/login'))
  }

}

function showRequestCommentInput(dispatch, login) {
  if (login.user) {
    dispatch({
      type: 'allRequest/showRequestCommentInput',
      payload: {},
    })
  }
  else {
    antdMessage.warning('Please login')
    dispatch(routerRedux.push('/user/login'))
  }

}

function UserRequestDetail({allRequest, login, dispatch}) {
  const {
    focusUserRequest,
    focusUserRequestLoading
  } = allRequest
  console.log('focusUserRequestLoading', focusUserRequestLoading)

  function requestVotesUp() {
    dispatch({
      type: 'allRequest/votesUpRequest',
      payload: {
        user_request_id: focusUserRequest['_id'],
      },
    })
  }

  function requestStar() {
    if (login.user) {
      if (focusUserRequest.user !== login.user._id) {
        dispatch({
          type: 'allRequest/starRequest',
          payload: {
            user_request_id: focusUserRequest['_id'],
          },
        })
      }
      else {
        antdMessage.warning('sorry,不能收藏自己的需求')
      }
    }
    else {
      antdMessage.warning('Please login')
      dispatch(routerRedux.push('/user/login'))
    }

  }

  function answerVotesUp(request_answer_id) {
    dispatch({
      type: 'allRequest/votesUpAnswer',
      payload: {
        request_answer_id: request_answer_id,
      },
    })
  }

  const clickSelectedProject = (e) => {
    let user_obj_id = localStorage.getItem('user_obj_id')
    if (user_obj_id === e.select_project.user) {
      window.open('/#/workspace/' + e.select_project._id + '?type=' + e.select_project.type)
    }
    else {
      window.open('/#/explore/' + e.select_project._id + '?type=' + e.select_project.type)
    }
  }

  const acceptAnswer = (request_answer_id) => {
    confirm({
      title: 'Are you sure accept this answer?',
      okText: 'Yes',
      okType: 'normal',
      cancelText: 'No',
      onOk() {
        dispatch({
          type: 'allRequest/acceptAnswer',
          payload: {
            user_request_id: focusUserRequest['_id'],
            request_answer_id: request_answer_id,
          },
        })
      },
    })
  }

  const deleteUserRequest = () => {
    confirm({
      title: 'Are you sure delete this request?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        dispatch({
          type: 'allRequest/deleteUserRequest',
          payload: {
            user_request_id: focusUserRequest['_id'],
          },
        })
        dispatch(routerRedux.push('/userrequest?tab=app'))
      },
    })
  }

  function appStatus(project) {
    if (!project.status) {
      return <div/>
    }
    if (project.status === 'deploying') {
      return <Tag color='gold' style={{cursor: 'default'}}>Deploying <Icon
        type="loading"/></Tag>
    } else if (project.status === 'active') {
      return <Tag color='green' style={{cursor: 'default'}}>Online</Tag>
    } else {
      return <Tag color='grey' style={{cursor: 'default'}}>Offline</Tag>
    }
  }

  function projectCard(e, type) {
    if (!e.select_project) {
      return null
    }
    else if (e.select_project.deleted) {
      return <Card bodyStyle={{color: 'red'}}>Ooops, this {type} has been
        deleted</Card>
    }
    else {
      return <Card title={e.select_project.name}
                   style={{cursor: 'pointer', width: '52%'}}
                   onClick={() => clickSelectedProject(e)}
                   extra={<div
                     style={{fontSize: '14px'}}> {appStatus(e.select_project)}</div>}>

        <p>{e.select_project.description}</p>
        {e.select_project.commits.length > 0 ?
          <div style={{marginTop: '35px', color: '#848d95'}}>
            <p>last commited
              at {showTime(e.select_project.commits[0]['timestamp'])}</p>
            <p>{e.select_project.commits[0]['message']}</p>
          </div> : null}
      </Card>
    }
  }

  if (focusUserRequest !== null) {
    // const {
    //   _id: user_obj_id,
    //   user_ID,
    // }
    //   = login.user
    const user_obj_id = get(login, 'user._id')
    const user_ID = get(login, 'user.user_ID')
    return (
      <div className={`main-container ${styles.normal}`}>
        <Spin spinning={focusUserRequestLoading}>
          <div>
            {/*<Button icon="caret-up"*/}
            {/*onClick={() => requestVotesUp()}*/}
            {/*type={focusUserRequest['vote_up_user'].includes(user_obj_id) ? 'primary' : ''}*/}
            {/*/>*/}
            {/*{focusUserRequest['vote_up_user'].length}*/}
            <h2
              style={{paddingBottom: 10}}>
              <Icon
                type={focusUserRequest.user === user_obj_id || focusUserRequest['star_user'].includes(user_obj_id) ? 'star' : 'star-o'}
                className={styles.star}
                style={{
                  fontSize: '22px', color: 'transparent',
                  background: focusUserRequest['star_user'].includes(user_obj_id) ? `url(${star}) no-repeat` : `url(${star_o}) no-repeat`,
                }}
                onClick={() => requestStar()}/>
              {focusUserRequest['title']} &nbsp;&nbsp;
              {focusUserRequest['user_ID'] === user_ID &&
              <span className={styles.rightButton}>
                  <RequestModal new={false} requestDetail={focusUserRequest}>
                    <Button icon='edit' style={{marginRight: 15}}/>
                  </RequestModal>
                {focusUserRequest.comments || focusUserRequest.answer ?
                  null :
                  <Button icon='delete' onClick={() => deleteUserRequest()}/>}

                </span>}
              {/*{focusUserRequest['user_ID']===user_ID && <Icon type="close" onClick={() => deleteUserRequest()}/>}*/}
            </h2>
          </div>
          <div className={styles.requestuser} style={{color: '#828A92'}}>
            <Icon
              type='star'
              style={{fontSize: '22px', color: 'transparent'}}/>
            <Icon
              type="user"
              style={{color: '#828A92'}}/>&nbsp;{focusUserRequest['user_ID']} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            {focusUserRequest['tags'].length > 0 && <Icon type="tag-o"/>}&nbsp;
            {focusUserRequest['tags'].length > 0 && focusUserRequest['tags'].join(',')}
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <Icon
              type="clock-circle-o"
              style={{color: '#828A92'}}/>&nbsp;{showTime(focusUserRequest['create_time'])}
          </div>

          <p
            className={styles.description}
            style={{color: '#828A92'}}>{get(focusUserRequest, 'description') ? get(focusUserRequest, 'description') : null}</p>
          {focusUserRequest.input ?
            <div style={{margin: '16px 0'}}><p
              style={{color: '#828A92'}}>Input: {focusUserRequest.input}</p>
            </div> : null}
          {focusUserRequest.output ? <div style={{margin: '16px 0'}}>
            <p style={{color: '#828A92'}}>Output: {focusUserRequest.output}</p>
          </div> : null}
          <h2
            className={styles.commentsAnswers}>{focusUserRequest.comments ? focusUserRequest.comments.length : 0} Comments</h2>
          <hr/>
          {/*{focusUserRequest.comments && <hr className={styles.eachCommentDiv}/>}*/}
          {focusUserRequest.comments && focusUserRequest.comments.map(e =>
            <div key={e._id}>
              <div className={styles.eachCommentDiv}>
                <p>{e.comments}&nbsp;-&nbsp;
                  <span
                    style={{color: '#828A92'}}>{e.user_ID} {showTime(e.create_time)}</span>
                </p>
              </div>
              <hr className={styles.eachCommentDiv}/>
            </div>)}
          <div style={{margin: '20px 8px 8px 0'}}>
            {focusUserRequest.commentState &&
            <WrappedCommentForm dispatch={dispatch}
                                comments_type={'request'}
                                _id={focusUserRequest._id}
                                login={login}
            />}
            {!(focusUserRequest.commentState) &&
            <p onClick={() => showRequestCommentInput(dispatch, login)}
               style={{color: '#848d95', cursor: 'pointer'}}>add a
              comment</p>}
            {/*<WrappedCommentForm dispatch={dispatch} comments_type={'request'}/>*/}
          </div>
          <div>
            <h2
              className={styles.commentsAnswers}>{focusUserRequest.answer ? Object.keys(focusUserRequest.answer).length : 0} Answers</h2>
            <hr/>
            <div>
            </div>
            <div>
              {focusUserRequest.answer && JsonToArray(focusUserRequest.answer).map(e =>
                <div key={e._id}>
                  <Row className={styles.eachAnswerDiv}>
                    <Col span={2}>
                      <div style={{
                        width: '100%',
                        textAlign: 'center',
                        fontSize: '22px',
                        cursor: 'pointer',
                      }}>
                        <Icon
                          type={e['vote_up_user'].includes(user_obj_id) ? 'like' : 'like-o'}
                          onClick={() => answerVotesUp(e._id)}
                          style={{color: '#34c0e2'}}
                        />
                      </div>
                      <div style={{
                        width: '100%',
                        textAlign: 'center',
                        fontSize: '22px',
                      }}>
                        {e['vote_up_user'].length}
                      </div>
                      {/*<div style={{*/}
                      {/*width: '100%',*/}
                      {/*textAlign: 'center',*/}
                      {/*fontSize: '26px',*/}
                      {/*cursor: 'pointer'*/}
                      {/*}}>*/}
                      {/*<Icon type="caret-down"/>*/}
                      {/*</div>*/}
                      {user_ID === focusUserRequest.user_ID &&
                      !focusUserRequest.accept_answer &&
                      <div style={{
                        width: '100%',
                        textAlign: 'center',
                        fontSize: '22px',
                        cursor: 'pointer',
                      }}>
                        <Icon type="check-circle-o"
                              style={{color: '#c1c1c1'}}
                              onClick={() => acceptAnswer(e._id)}/>
                      </div>}

                      {focusUserRequest.accept_answer &&
                      focusUserRequest.accept_answer === e._id &&
                      <div style={{
                        width: '100%',
                        textAlign: 'center',
                        fontSize: '26px',
                        cursor: 'pointer',
                        color: 'green',
                      }}>
                        <Icon type="check-circle-o"/>
                      </div>}

                    </Col>
                    <Col span={22}>
                      <div
                        style={{fontSize: '14px'}}>{projectCard(e, focusUserRequest.type)}
                      </div>
                      <div>
                        <div className={styles.eachAnswer}>
                          <div dangerouslySetInnerHTML={{
                            __html: e.answer,
                          }}/>
                        </div>
                        <div className={styles.eachAnswerContentDiv}>
                          <p>{e.answer_user_ID}</p>
                          <p>{showTime(e.create_time)}</p>
                          {/*<span></span>*/}
                          {/*<span style={{float: 'right'}}>*/}
                          {/**/}
                          {/*</span>*/}
                        </div>
                      </div>
                      {e.comment && <hr/>}
                      {e.comment && e.comment.map(e =>
                        <div key={e._id}>
                          <div className={styles.eachAnswerComment}>
                            <p>{e.comments} - {e.user_ID} at {showTime(e.create_time)}</p>
                          </div>
                          <hr/>
                        </div>,
                      )}
                      {e.commentState &&
                      <WrappedCommentForm dispatch={dispatch}
                                          comments_type={'answer'}
                                          _id={e._id}
                                          login={login}/>}
                      {!(e.commentState) &&
                      <p
                        onClick={() => showAnswerCommentInput(dispatch, e._id, login)}
                        style={{color: '#848d95', cursor: 'pointer'}}>add a
                        comment</p>}
                    </Col>
                  </Row>
                  <hr/>
                </div>)}
            </div>
          </div>
          <div className="demo">
            <h2
              style={{paddingBottom: 10}}>
              Answer&nbsp;
              <Icon type="edit"/>
            </h2>
            {login.user ?
              <WrappedAnswerForm dispatch={dispatch}
                                 type={focusUserRequest.type}
                                 login={login}/> :
              <NotLogin dispatch={dispatch} text={'回答'}/>}
          </div>
        </Spin>
      </div>
    )
  }
  else {
    return (<div/>)
  }
}

const WrappedCommentForm = Form.create()(CommentForm)
const WrappedAnswerForm = Form.create()(AnswerForm)
export default connect(({allRequest, login}) => ({
  allRequest,
  login,
}))(UserRequestDetail)
