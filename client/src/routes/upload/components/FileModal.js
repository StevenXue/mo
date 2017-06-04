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

    return (
      <span>
        <span onClick={this.showModelHandler}>
          { children }
        </span>
        <Modal
          title="文件上传"
          visible={this.props.upload.visible}
          // onOk={this.okHandler}
          onCancel={this.hideModelHandler}
          footer={null}
        >
          <Form layout='horizontal' onSubmit={(e) => this.okHandler(e)}>
            <FormItem
              {...formItemLayout}
              label="是否私有"
              hasFeedback
            >
              {getFieldDecorator('isPrivate', {
                rules: [
                  { required: true, message: '请选择文件是否私有' },
                ],
              })(
                <Select placeholder="请选择文件是否私有">
                  <Option value="true">是</Option>
                  <Option value="false">否</Option>
                </Select>
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="描述"
            >
              {
                getFieldDecorator('description', {
                  initialValue: name,
                  rules: [
                    { required: true, message: '请输入描述' },
                  ],
                })(<Input />)
              }
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="上传"
              extra="请选择你的数据文件"
              fileList={this.state.fileList}
            >
              {getFieldDecorator('upload', {
                valuePropName: 'fileList',
                // getValueFromEvent: this.normFile,
                rules: [
                  { required: true, message: '请选择文件' },
                ],
              })(
                <Upload
                  name="uploaded_file"
                  action="/upload.do"
                  beforeUpload={(e) => this.beforeUpload(e)}
                >
                  <Button>
                    <Icon type="upload" /> 点击上传
                  </Button>
                </Upload>
              )}
            </FormItem>
            <FormItem
              wrapperCol={{ span: 12, offset: 6 }}
            >
              <Button type="primary" htmlType="submit">Submit</Button>
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
