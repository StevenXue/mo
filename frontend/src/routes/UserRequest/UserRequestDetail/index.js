import React from 'react'
import {connect} from 'dva'
import {routerRedux} from 'dva/router'
import styles from './index.less'
import {Tabs, Switch, Button, Input, Form, Card} from 'antd'
import Highlight from 'react-highlight'
import {get} from 'lodash'
import {showTime} from '../../../utils/index'

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

    console.log('this.props: ', this.props)
    this.props.dispatch({
      type: 'allRequest/makeNewRequestComment',
      payload: {
        comments: values['comment'],
      }
    })
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
            <Input className={styles.inputtext} placeholder="Any idea to help?"/>
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

function UserRequestDetail({allRequest, dispatch}) {
  const {
    focusUserRequest,
  } = allRequest

  if (focusUserRequest !== null) {
    return (
      <div className={`main-container ${styles.normal}`}>
        <h2
          style={{paddingBottom: 10}}>{focusUserRequest['title']}
        </h2>
        <p>{get(focusUserRequest, 'request_description') ? get(focusUserRequest, 'request_description') : null}</p>
        <h2 style={{padding: '20px 0 0 0'}}>Comments</h2>

        {focusUserRequest.comments && focusUserRequest.comments.map(e =>
          <Card key={e._id} title={e.comments_user_id}
                style={{cursor: 'pointer'}}>
            <div>
              <p>{showTime(e.create_time)}</p>
              <p>{e.comments}</p>
            </div>
          </Card>)}

        <div style={{margin: '20px 8px 8px 0'}}>
          <WrappedCommentForm dispatch={dispatch}/>
        </div>
      </div>
    )
  }
  else {
    return (<div/>)
  }
}

const WrappedCommentForm = Form.create()(CommentForm)
export default connect(({allRequest}) => ({allRequest}))(UserRequestDetail)
