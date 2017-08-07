import React, { Component } from 'react';
import { Modal, Form, Input, Button, Upload, Icon, Select } from 'antd';
import { connect } from 'dva';
import PropTypes from 'prop-types';
import {jupyterServer,flaskServer } from '../../../constants';


const FormItem = Form.Item;
const Option = Select.Option;

class FileModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ...props.upload,
    };
  }

  // normFile = (e) => {
  //   console.log('Upload event:', e);
  //   if (Array.isArray(e)) {
  //     return e;
  //   }
  //   return e && e.fileList;
  // }

  showModelHandler = (e) => {
    if (e) e.stopPropagation();
    this.props.dispatch({ type: 'upload/showModal' })
  };

  hideModelHandler = () => {
    this.props.dispatch({ type: 'upload/hideModal' })
  };

  okHandler = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.props.dispatch({ type: 'upload/upload', payload: values })
      } else {
        console.log('error', err);
      }
    });
  };

  beforeUpload = (file) => {
    console.log(file);
    this.props.form.setFieldsValue({
      'upload': [file]
    });
    // let reader = new FileReader();
    // reader.readAsDataURL(file);
    //
    // reader.onloadend = function () {
    // }.bind(this);

    //Prevent file uploading
    return false;
  }

  render() {
    const { children } = this.props;
    const { getFieldDecorator } = this.props.form;
    const { name } = this.props.record;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };
    const upload = this.props.upload
    return (
      <span>
        <span onClick={this.showModelHandler}>
          { children }
        </span>
        <Modal
          title="文件上传"
          visible={upload.visible}
          // onOk={this.okHandler}
          onCancel={this.hideModelHandler}
          footer={null}
        >
          <Form layout='horizontal' onSubmit={(e) => this.okHandler(e)}>
            <FormItem
              {...formItemLayout}
              label="Description"
            >
              {
                getFieldDecorator('description', {
                  initialValue: name,
                  rules: [
                    { required: true, message: 'Please enter description' },
                  ],
                })(<Input />)
              }
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="Choose File"
              extra="Please choose file"
              fileList={this.state.fileList}
            >
              {getFieldDecorator('upload', {
                valuePropName: 'fileList',
                // getValueFromEvent: this.normFile,
                rules: [
                  { required: true, message: 'please choose file' },
                ],
              })(
                <Upload
                  name="uploaded_file"
                  action="/upload.do"
                  beforeUpload={(e) => this.beforeUpload(e)}
                >
                  <Button>
                    <Icon type="upload" /> choose file
                  </Button>
                </Upload>
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="File Content"
              hasFeedback
            >
              {getFieldDecorator('type', {
                initialValue: 'table',
                rules: [
                  { required: true, message: 'please choose file content type' },
                ],
              })(
                <Select >
                  <Option value="table">table</Option>
                  <Option value="image">image</Option>
                  <Option value="text">text</Option>
                  <Option value="audio">audio</Option>
                </Select>
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="Privacy"
              hasFeedback
            >
              {getFieldDecorator('isPrivate', {
                initialValue: 'false',
                rules: [
                  { required: true, message: 'please choose privacy' },
                ],
              })(
                <Select >
                  <Option value="false">public</Option>
                  <Option value="true">private</Option>
                </Select>
              )}
            </FormItem>
            <FormItem
              wrapperCol={{ span: 12, offset: 6 }}
            >
              <Button type="primary" htmlType="submit" loading={upload.uploading}>Submit</Button>
            </FormItem>
          </Form>
        </Modal>
      </span>
    );
  }
}

FileModal.propTypes = {
  form: PropTypes.object.isRequired,
  type: PropTypes.string,
  item: PropTypes.object,
  onOk: PropTypes.func,
};

export default connect(({ upload }) => ({ upload }))(Form.create()(FileModal));
