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

class AddModuleModal extends React.Component {

  // makeNewRequest = (values) => {
  //   this.props.dispatch({
  //     type: 'allRequest/makeNewRequest',
  //     payload: {
  //       requestTitle: values['requestTitle'],
  //       requestDescription: values['requestDescription'],
  //       requestDataset: values['requestDataset'],
  //     }
  //   })
  // }

  componentDidMount() {
    // To disabled submit button at the beginning.
    this.props.form.validateFields()
  }


  handleCancel = (e) => {
    this.props.dispatch({
      type: 'module/updateState',
      payload: {showModal: false},
    })
  }

  handleSubmit = (e) => {
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values)

        //发送请求
        this.props.dispatch({
          type: 'module/create',
          payload: {
            name: values.name,
            description: values.description
          }
        })

        // 隐藏
        this.props.dispatch({
          type: 'module/updateState',
          payload: {showModal: false},
        })



        // this.makeNewRequest(values)
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
          visible={this.props.visible}
          onCancel={this.handleCancel}
          footer={null}
        >
          <h1>Create a new Module</h1>
          <h2>It's easier for others to help with more information you
            provide</h2>
          <br/>
          <Form onSubmit={this.handleSubmit}>
            <h2>Name</h2>
            <FormItem
              validateStatus={inputFieldError ? 'error' : ''}
              help={inputFieldError || ''}
            >
              {getFieldDecorator('name', {
                initialValue: this.initialValue("name"),
                rules: [{
                  required: true,
                  message: 'Name is missing'
                }],
              })(
                <Input className={styles.inputtext}
                       placeholder="What's your module name"
                />
              )}
            </FormItem>
            <h2>Description(Optional)</h2>
            <FormItem
              validateStatus={inputFieldError ? 'error' : ''}
              help={inputFieldError || ''}
            >
              {getFieldDecorator('description', {
                initialValue: this.initialValue('description'),
                rules: [{
                  required: false,
                  message: 'hello'
                }],
              })(
                <TextArea className={styles.inputtext}
                          autosize={{minRows: 4, maxRows: 50}}
                          placeholder="Provide a complete description of your request"
                />
              )}
            </FormItem>
            {/*<h2>Dataset(Optional)</h2>*/}
            {/*<FormItem*/}
              {/*validateStatus={inputFieldError ? 'error' : ''}*/}
              {/*help={inputFieldError || ''}*/}
            {/*>*/}
              {/*{getFieldDecorator('requestDataset', {*/}
                {/*initialValue: this.initialValue('requestDataset'),*/}
                {/*rules: [{*/}
                  {/*required: false,*/}
                  {/*message: 'hello'*/}
                {/*}],*/}
              {/*})(*/}
                {/*<TextArea className={styles.inputtext}*/}
                          {/*autosize={{minRows: 2, maxRows: 50}}*/}
                          {/*placeholder="URL to your dataset"*/}
                {/*/>*/}
              {/*)}*/}
            {/*</FormItem>*/}
            <FormItem>
              <Button
                type="primary"
                htmlType="submit"
                disabled={hasErrors(getFieldsError())}
              >
                {'Add your module'}
              </Button>
            </FormItem>
          </Form>
        </Modal>
      </div>
    )
  }
}

const WrappedAddModuleModal = Form.create()(AddModuleModal)
connect(({allRequest}) => ({allRequest}))(WrappedAddModuleModal)
export default WrappedAddModuleModal
