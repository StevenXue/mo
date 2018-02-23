import React from 'react'
import {connect} from 'dva'
import {routerRedux} from 'dva/router'
import styles from './index.less'
import {Tabs, Switch, Button, Input, Form, Card, Icon} from 'antd'
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
          request_answer_id:this.props.request_answer_id,
        }
      })
    }
    }

  handleSubmit = (e) => {
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values)
      }
      this.make_comment(values)
    })
  }

  render() {
    const {getFieldDecorator, getFieldsError, getFieldError, isFieldTouched} = this.props.form
    // Only show error after a field is touched.
    const emptyCommentError = isFieldTouched('comment') && getFieldError('comment')
    return (
      <Form layout="inline" onSubmit={this.handleSubmit}>
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
        <FormItem>
          <Button
            type="primary"
            htmlType="submit"
            disabled={hasErrors(getFieldsError())}
          >
            Comment
          </Button>
        </FormItem>
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

function UserRequestDetail({allRequest,login, dispatch}) {
  const {
    focusUserRequest,
  } = allRequest

  const {_id:user_obj_id}
  = login.user


  function requestvotesup() {
    dispatch({
      type: 'allRequest/votesUpRequest',
      payload: {
        user_request_id: focusUserRequest['_id'],
      }
    })
  }

  function requeststar() {
    dispatch({
      type: 'allRequest/starRequest',
      payload: {
        user_request_id: focusUserRequest['_id'],
      }
    })
  }

  function answervotesup(request_answer_id) {
    dispatch({
      type: 'allRequest/votesUpAnswer',
      payload: {
        request_answer_id: request_answer_id,
      }
    })
  }

  if (focusUserRequest !== null) {
    return (
      <div className={`main-container ${styles.normal}`}>
        <div>
          <h2
            style={{paddingBottom: 10 }}>{focusUserRequest['title']}
          </h2>
          <Button icon="caret-up"
                  onClick={()=>requestvotesup()}
                  type = {focusUserRequest['votes_up_user'].includes(user_obj_id)?'primary':''}
          />
          {focusUserRequest['votes_up_user'].length }
          <Icon type={focusUserRequest['star_user'].includes(user_obj_id)?"star":"star-o"}
                style={{fontSize: '22px', color: '#34c0e2'}}
                onClick={()=>requeststar()}/>
        </div>

        <p className={styles.description}>{get(focusUserRequest, 'description') ? get(focusUserRequest, 'description') : null}</p>
         <h2 style={{padding: '20px 0 0 0', fontSize:'14px'}}>{focusUserRequest.comments.length} Comments</h2>
        <hr />
        {focusUserRequest.comments && focusUserRequest.comments.map(e =>
          <div>
            <div>
              <p>{e.comments}</p>
              <p>- {e.comments_user_id}</p>
              <p>{showTime(e.create_time)}</p>
            </div>
            <hr />
          </div>)}
        <div style={{margin: '20px 8px 8px 0'}}>
          <WrappedCommentForm dispatch={dispatch} comments_type={'request'}/>
        </div>
        <div>
          <h2>Answers</h2>
          <div>

          </div>
          <div>
            {focusUserRequest.answer && JsonToArray(focusUserRequest.answer).map(e =>
              <div>
                <Button icon="caret-up"
                        onClick={()=>answervotesup(e._id)}
                        type = {e['votes_up_user'].includes(user_obj_id)?'primary':''}
                        />
                {e['votes_up_user'].length }
                <div>
                  <div dangerouslySetInnerHTML={{
                    __html: e.answer
                  }}/>
                  <p>- {e.answer_user_id}</p>
                  <p>{showTime(e.create_time)}</p>
                </div>
                {e.comment && e.comment.map(e =>
                    <div>
                      <p>------------</p>
                      <p>{e.comments}</p>
                      <p>- {e.comments_user_id}</p>
                      <p>{showTime(e.create_time)}</p>
                    </div>
                  )}
                <WrappedCommentForm dispatch={dispatch}
                                    comments_type={'answer'}
                                    request_answer_id={e._id}/>
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
export default connect(({allRequest,login}) => ({allRequest,login}))(UserRequestDetail)
