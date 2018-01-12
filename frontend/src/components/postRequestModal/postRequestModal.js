import {Modal, Button, Input, Form, notification} from 'antd'
import styles from './postRequestModal.less'
import React from 'react'
import {connect} from 'dva'

const {TextArea} = Input
const FormItem = Form.Item
import {get} from 'lodash'

function hasErrors(fieldsError) {
  return Object.keys(fieldsError).some(field => fieldsError[field])
}

class PostRequestModal extends React.Component {

  makeNewRequest = (values) => {
    this.props.dispatch({
      type: 'allRequest/makeNewRequest',
      payload: {
        // served_model_id: get(this.props.deployment.modelsJson, `[${this.props.deployment.focusModelId}]['served_model']['_id']`),
        requestTitle: values['requestTitle'],
        requestDescription: values['requestDescription'],
      }
    })
  }

  componentDidMount() {
    // To disabled submit button at the beginning.
    this.props.form.validateFields()
  }

  showModal = (modalState) => {
    this.props.dispatch({
      type: 'allRequest/showModal',
      payload: {modalState: modalState},
    })
  }

  handleOk = (e) => {
    console.log(e)
    this.setState({
      visible: false,
    })
  }

  handleCancel = (e) => {
    console.log(e)
    this.props.dispatch({
      type: 'allRequest/showModal',
      payload: {modalState: false},
    })
  }

  handleSubmit = (e) => {
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values)
        this.showModal(false)
        this.makeNewRequest(values)
      }
    })
  }

  initialValue = (deployInfo) => {
    return []
  }


  render() {
    const {getFieldDecorator, getFieldsError, getFieldError, isFieldTouched} = this.props.form
    const inputFieldError = isFieldTouched('inputField') && getFieldError('inputField')

    return (
      <div>
        <Modal
          // title="hh"
          visible={this.props.visible}
          // onOk={this.handleOk}
          onCancel={this.handleCancel}
          footer={null}
        >
          <h1>Write down your request</h1>
          <h2>It's easier for others to help with more information you
            provide</h2>
          <br/>
          <Form onSubmit={this.handleSubmit}>
            <h2>Title</h2>
            <FormItem
              validateStatus={inputFieldError ? 'error' : ''}
              help={inputFieldError || ''}
            >
              {getFieldDecorator('requestTitle', {
                initialValue: this.initialValue("requestTitle"),
                rules: [{
                  required: true,
                  message: 'Title is missing'
                }],
              })(
                <Input className={styles.inputtext}
                       placeholder="What's your request?Be specific"
                />
              )}
            </FormItem>
            <h2>Description</h2>
            <FormItem
              validateStatus={inputFieldError ? 'error' : ''}
              help={inputFieldError || ''}
            >
              {getFieldDecorator('requestDescription', {
                initialValue: this.initialValue('requestDescription'),
                rules: [{
                  required: true,
                  message: 'Description is missing'
                }],
              })(
                <TextArea className={styles.inputtext}
                          autosize={{minRows: 4, maxRows: 50}}
                          placeholder="Provide a complete description of your request"
                />
              )}
            </FormItem>
            <h2>Dataset(Optional)</h2>
            <FormItem
              validateStatus={inputFieldError ? 'error' : ''}
              help={inputFieldError || ''}
            >
              {getFieldDecorator('requestDataset', {
                initialValue: this.initialValue('requestDataset'),
                rules: [{
                  required: false,
                  message: 'hello'
                }],
              })(
                <TextArea className={styles.inputtext}
                          autosize={{minRows: 2, maxRows: 50}}
                          placeholder="URL to your dataset"
                />
              )}
            </FormItem>
            <FormItem>
              <Button
                type="primary"
                htmlType="submit"
                disabled={hasErrors(getFieldsError())}
              >
                {'Post your request'}
              </Button>
            </FormItem>
          </Form>
        </Modal>
      </div>
    )
  }
}

const WrappedPostRequestModal = Form.create()(PostRequestModal)
connect(({allRequest}) => ({allRequest}))(WrappedPostRequestModal)
export default WrappedPostRequestModal
