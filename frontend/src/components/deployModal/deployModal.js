import {Modal, Button, Input, Form, notification} from 'antd';
import styles from './deployModal.less';
import React from 'react';
import {connect} from 'dva';

const {TextArea} = Input;
const FormItem = Form.Item;
import {get} from 'lodash';
import EditableTagGroup from '../../components/Tag/tag';


function hasErrors(fieldsError) {
  return Object.keys(fieldsError).some(field => fieldsError[field]);
}

class DeployModal extends React.Component {

  openNotificationWithIcon = () => {
    notification['success']({
      message: 'Model successfully deployed',
      // description: 'This is the content of the notification. This is the content of the notification. This is the content of the notification.',
    });
  };

  setModelHowToUse = (values) => {
    this.props.dispatch({
      type: 'deployment/undateDeployModelInfo',
      payload: {
        served_model_id: get(this.props.deployment.modelsJson, `[${this.props.deployment.focusModelId}]['served_model']['_id']`),
        deployName: values['deployName'],
        deployDescription: values['deployDescription'],
        deployInput: values['deployInput'],
        deployOutput: values['deployOutput'],
        deployExamples: values['deployExamples'],
      }
    });
    this.openNotificationWithIcon();
  };

  firstDeployModel = (values) => {
    this.props.dispatch({
      type: 'deployment/firstDeployModel',
      payload: {
        deployName: values['deployName'],
        deployDescription: values['deployDescription'],
        deployInput: values['deployInput'],
        deployOutput: values['deployOutput'],
        deployExamples: values['deployExamples'],
      }
    });
    this.openNotificationWithIcon();
  };

  componentDidMount() {
    // To disabled submit button at the beginning.
    this.props.form.validateFields();
  }

  showModal = (modalState) => {
    this.props.dispatch({
      type: 'deployment/showModal',
      payload: {modalState: modalState},
    });
  };

  handleOk = (e) => {
    console.log(e);
    this.setState({
      visible: false,
    });
  };

  handleCancel = (e) => {
    console.log(e);
    this.props.dispatch({
      type: 'deployment/showModal',
      payload: {modalState: false},
    });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
        this.showModal(false);
        if (this.props.firstDeploy) {
          this.firstDeployModel(values);
        }
        else {
          this.setModelHowToUse(values);
        }
      }
    });
  };

  initialValue = (deployInfo) => {

    let output = get(this.props.deployment.modelsJson, `[${this.props.deployment.focusModelId}]['served_model'][${deployInfo}]`);
    if (output) {
      return output
    }
    else {
      return []
    }
  };


  render() {
    const {getFieldDecorator, getFieldsError, getFieldError, isFieldTouched} = this.props.form;
    const inputFieldError = isFieldTouched('inputField') && getFieldError('inputField');

    return (
      <div>
        <Modal
          title="Deployment Info"
          visible={this.props.visible}
          // onOk={this.handleOk}
          onCancel={this.handleCancel}
          footer={null}
        >
          <p>填写以下内容让你的模型更受欢迎</p>

          <Form onSubmit={this.handleSubmit}>
            <h1>Overview</h1>
            <h2>Name</h2>
            <FormItem
              validateStatus={inputFieldError ? 'error' : ''}
              help={inputFieldError || ''}
            >
              {getFieldDecorator('deployName', {
                initialValue: this.initialValue('name'),
                rules: [{
                  required: true,
                  message: 'hello'
                }],
              })(
                <Input className={styles.inputtext}
                       placeholder="Provide a good name"
                />
              )}
            </FormItem>
            <h2>Description</h2>
            <FormItem
              validateStatus={inputFieldError ? 'error' : ''}
              help={inputFieldError || ''}
            >
              {getFieldDecorator('deployDescription', {
                initialValue: this.initialValue('description'),
                rules: [{
                  required: true,
                  message: 'hello'
                }],
              })(
                <TextArea className={styles.inputtext}
                          autosize={{minRows: 4, maxRows: 50}}
                          placeholder="Provide a short overview of your algorithm that explains the value and primary use cases."
                />
              )}
            </FormItem>
            <h1>Usage</h1>
            <h2>Input</h2>
            <FormItem
              validateStatus={inputFieldError ? 'error' : ''}
              help={inputFieldError || ''}
            >

              {getFieldDecorator('deployInput', {
                initialValue: this.initialValue('input_info'),
                rules: [{
                  required: true,
                  message: 'hello'
                }],
              })(
                <TextArea className={styles.inputtext}
                          autosize={{minRows: 4, maxRows: 50}}
                          placeholder="Describe the input fields for your algorithm."/>
              )}
            </FormItem>
            <h2>Output</h2>
            <FormItem
              validateStatus={inputFieldError ? 'error' : ''}
              help={inputFieldError || ''}
            >

              {getFieldDecorator('deployOutput', {

                initialValue: this.initialValue('output_info'),

                rules: [{
                  required: true,
                  message: 'hello'
                }],
              })(
                <TextArea className={styles.inputtext}
                          autosize={{minRows: 4, maxRows: 50}}
                          placeholder="Describe the output fields for your algorithm."/>
              )}
            </FormItem>
            <h2>Examples</h2>
            <FormItem
              validateStatus={inputFieldError ? 'error' : ''}
              help={inputFieldError || ''}
            >
              {getFieldDecorator('deployExamples', {
                initialValue: this.initialValue('examples'),
                rules: [{
                  required: true,
                  message: 'hello'
                }],
              })(
                <TextArea className={styles.inputtext}
                          autosize={{minRows: 4, maxRows: 50}}
                          placeholder="Provide and explain examples of input and output for your algorithm."/>
              )}
            </FormItem>
            {/*<EditableTagGroup />*/}
            <FormItem>
              <Button
                type="primary"
                htmlType="submit"
                disabled={hasErrors(getFieldsError())}
              >
                {this.props.firstDeploy ? 'Deploy' : 'Confirm'}
              </Button>
            </FormItem>
          </Form>
        </Modal>
      </div>
    );
  }
}

const WrappedDeployModal = Form.create()(DeployModal);
connect(({deployment}) => ({deployment}))(WrappedDeployModal);
export default WrappedDeployModal;
