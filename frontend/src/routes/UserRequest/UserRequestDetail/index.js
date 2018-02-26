import React from 'react'
import {connect} from 'dva'
import {routerRedux} from 'dva/router'
import styles from './index.less'
import {Tabs, Switch, Button, Input, Form, Card, Icon, Row, Col} from 'antd'
import {get} from 'lodash'
import {showTime} from '../../../utils/index'
import BraftEditor from 'braft-editor'
import 'braft-editor/dist/braft.css'
import {JsonToArray} from "../../../utils/JsonUtils"

const {TextArea} = Input
const TabPane = Tabs.TabPane
const FormItem = Form.Item

function hasErrors(fieldsError) {
  return Object.keys(fieldsError).some(field => fieldsError[field])
}

class CommentForm extends React.Component {

  componentDidMount() {
    // To disabled submit button at the beginning.
    this.props.form.validateFields()
  }

  make_comment = (values) => {
    // console.log('this.props: ', this.props)
    if (this.props.comments_type === 'request') {
      this.props.dispatch({
        type: 'allRequest/makeNewRequestComment',
        payload: {
          comments: values['comment'],
          comments_type: this.props.comments_type,
        }
      })
    }
    else {
      this.props.dispatch({
        type: 'allRequest/makeNewRequestComment',
        payload: {
          comments: values['comment'],
          comments_type: this.props.comments_type,
          request_answer_id: this.props.request_answer_id,
        }
      })
    }
  }

  handleSubmit = (e) => {
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values)
        this.make_comment(values)
      }

    })
  }

  onBlur = () => {
    if (this.props.comments_type === 'request') {
      showRequestCommentInput(this.props.dispatch)
    }
    if (this.props.comments_type === 'answer') {
      showAnswerCommentInput(this.props.dispatch, this.props.request_answer_id,)
    }
  }

  render() {
    const {getFieldDecorator, getFieldsError, getFieldError, isFieldTouched} = this.props.form
    // Only show error after a field is touched.
    const emptyCommentError = isFieldTouched('comment') && getFieldError('comment')
    return (
      <Form layout="inline" onSubmit={this.handleSubmit}
            onBlur={() => this.onBlur()}>
        <FormItem
          validateStatus={emptyCommentError ? 'error' : ''}
          help={emptyCommentError || ''}
        >
          {getFieldDecorator('comment', {
            rules: [{required: true, message: ''}],
          })(
            <Input className={styles.inputtext}
                   placeholder="Any idea to help?"/>
          )}
        </FormItem>
        {/*<FormItem>*/}
        {/*<Button*/}
        {/*type="primary"*/}
        {/*htmlType="submit"*/}
        {/*disabled={hasErrors(getFieldsError())}*/}
        {/*>*/}
        {/*Comment*/}
        {/*</Button>*/}
        {/*</FormItem>*/}
      </Form>
    )
  }
}


class AnswerForm extends React.Component {

  state = {
    content: null,
    html: null,
  }

  handleSubmit = () => {
    console.log(this.state.html)
    this.props.dispatch({
      type: 'allRequest/makeNewRequestAnswer',
      payload: {
        answer: this.state.html,
      }
    })
  }

  handleChange = (content) => {
    // console.log(content)
    this.setState({
      content
    })
  }

  handleHTMLChange = (html) => {
    if (html === "<p></p>") {
      html = null
    }
    this.setState({
      html
    })
  }

  validateFn = (file) => {
    return file.size < 1024 * 100
  }

  render() {
    const editorProps = {
      placeholder: 'Hello World!',
      height: 200,
      language: 'en',
      initialContent: this.state.content,
      onChange: this.handleChange,
      onHTMLChange: this.handleHTMLChange,
      media: {
        image: true, // 开启图片插入功能
        video: false, // 关闭视频插入功能
        audio: false, // 关闭音频插入功能
        validateFn: this.validateFn, // 指定本地校验函数
        uploadFn: null // 指定上传函数
      }
    }
    return (
      <div className="demo">
        <BraftEditor {...editorProps}/>
        <Button
          type="primary"
          htmlType="submit"
          disabled={this.state.html === null}
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


function showAnswerCommentInput(dispatch, request_answer_id) {
  dispatch({
    type: 'allRequest/showAnswerCommentInput',
    payload: {
      request_answer_id: request_answer_id,
    }
  })
}


function showRequestCommentInput(dispatch) {
  dispatch({
    type: 'allRequest/showRequestCommentInput',
    payload: {}
  })
}


function UserRequestDetail({allRequest, login, dispatch}) {
  const {
    focusUserRequest,
  } = allRequest

  const {_id: user_obj_id}
    = login.user


  function requestVotesUp() {
    dispatch({
      type: 'allRequest/votesUpRequest',
      payload: {
        user_request_id: focusUserRequest['_id'],
      }
    })
  }

  function requestStar() {
    dispatch({
      type: 'allRequest/starRequest',
      payload: {
        user_request_id: focusUserRequest['_id'],
      }
    })
  }

  function answerVotesUp(request_answer_id) {
    dispatch({
      type: 'allRequest/votesUpAnswer',
      payload: {
        request_answer_id: request_answer_id,
      }
    })
  }

  function acceptAnswer(request_answer_id) {
    dispatch({
      type: 'allRequest/acceptAnswer',
      payload: {
        user_request_id: focusUserRequest['_id'],
        request_answer_id: request_answer_id,
      }
    })
  }


  if (focusUserRequest !== null) {
    return (
      <div className={`main-container ${styles.normal}`}>
        <div>

          <Button icon="caret-up"
                  onClick={() => requestVotesUp()}
                  type={focusUserRequest['votes_up_user'].includes(user_obj_id) ? 'primary' : ''}
          />
          {focusUserRequest['votes_up_user'].length}

          <Icon
            type={focusUserRequest['star_user'].includes(user_obj_id) ? "star" : "star-o"}
            style={{fontSize: '22px', color: '#34c0e2'}}
            onClick={() => requestStar()}/>
          <h2
            style={{paddingBottom: 10}}>{focusUserRequest['title']}
          </h2>
        </div>
        <div className={styles.requestuser}>
          <Icon
            type="user"/>&nbsp;{focusUserRequest['user_id']} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          {focusUserRequest['tags'].length > 0 && <Icon type="tag-o"/>}&nbsp;
          {focusUserRequest['tags'].length > 0 && focusUserRequest['tags'].join(",")}
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <Icon
            type="clock-circle-o"/>&nbsp;{showTime(focusUserRequest['create_time'])}
        </div>
        <p
          className={styles.description}>{get(focusUserRequest, 'description') ? get(focusUserRequest, 'description') : null}</p>
        <h2
          className={styles.commentsAnswers}>{focusUserRequest.comments ? focusUserRequest.comments.length : 0} Comments</h2>
        <hr/>
        {/*{focusUserRequest.comments && <hr className={styles.eachCommentDiv}/>}*/}
        {focusUserRequest.comments && focusUserRequest.comments.map(e =>
          <div>
            <div className={styles.eachCommentDiv}>
              <p>{e.comments} - {e.comments_user_id} {showTime(e.create_time)}</p>
            </div>
            <hr className={styles.eachCommentDiv}/>
          </div>)}
        <div style={{margin: '20px 8px 8px 0'}}>
          {focusUserRequest.commentState &&
          <WrappedCommentForm dispatch={dispatch}
                              comments_type={'request'}
          />}
          {!(focusUserRequest.commentState) &&
          <p onClick={() => showRequestCommentInput(dispatch)}
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
              <div>
                <Row className={styles.eachAnswerDiv}>
                  <Col span={2}>
                    <div style={{
                      width: '100%',
                      textAlign: 'center',
                      fontSize: '26px',
                      cursor: 'pointer'
                    }}>
                      <Icon type="caret-up"
                            onClick={() => answerVotesUp(e._id)}
                            style={e['votes_up_user'].includes(user_obj_id) ? {color: '#34c0e2'} : {}}
                      />
                    </div>
                    <div style={{
                      width: '100%',
                      textAlign: 'center',
                      fontSize: '28px'
                    }}>
                      {e['votes_up_user'].length}
                    </div>
                    <div style={{
                      width: '100%',
                      textAlign: 'center',
                      fontSize: '26px',
                      cursor: 'pointer'
                    }}>
                      <Icon type="caret-down"/>
                    </div>
                    <div style={{
                      width: '100%',
                      textAlign: 'center',
                      fontSize: '26px',
                      color: '#34c0e2',
                      cursor: 'pointer'
                    }}>
                      <Icon type="star-o"/>
                    </div>
                    {login.user.user_ID === focusUserRequest.user_id &&
                    !focusUserRequest.accept_answer &&
                    <div style={{
                      width: '100%',
                      textAlign: 'center',
                      fontSize: '26px',
                      cursor: 'pointer'
                    }}>
                      <Icon type="check-circle-o"
                            onClick={() => acceptAnswer(e._id)}/>
                    </div>}

                    {focusUserRequest.accept_answer &&
                    focusUserRequest.accept_answer === e._id &&
                    <div style={{
                      width: '100%',
                      textAlign: 'center',
                      fontSize: '26px',
                      cursor: 'pointer',
                      color: 'red'
                    }}>
                      <Icon type="check-circle-o"/>
                    </div>}

                  </Col>
                  <Col span={22}>
                    <div>
                      <div className={styles.eachAnswer}>
                        <div dangerouslySetInnerHTML={{
                          __html: e.answer
                        }}/>
                      </div>
                      <div className={styles.eachAnswerContentDiv}>
                        <p>- {e.answer_user_id}</p>
                        <p>{showTime(e.create_time)}</p>
                      </div>
                    </div>
                    {e.comment && <hr/>}
                    {e.comment && e.comment.map(e =>
                      <div>
                        <div className={styles.eachAnswerComment}>
                          <p>{e.comments} - {e.comments_user_id} at {showTime(e.create_time)}</p>
                        </div>
                        <hr/>
                      </div>
                    )}
                    {e.commentState &&
                    <WrappedCommentForm dispatch={dispatch}
                                        comments_type={'answer'}
                                        request_answer_id={e._id}/>}
                    {!(e.commentState) &&
                    <p onClick={() => showAnswerCommentInput(dispatch, e._id)}
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
            style={{paddingBottom: 10}}> Your Answer
          </h2>
          <AnswerForm dispatch={dispatch}/>
        </div>
      </div>
    )
  }
  else {
    return (<div/>)
  }
}

const WrappedCommentForm = Form.create()(CommentForm)
export default connect(({allRequest, login}) => ({
  allRequest,
  login
}))(UserRequestDetail)
