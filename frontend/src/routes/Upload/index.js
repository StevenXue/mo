import React, { Component } from 'react'
import { Form, Input, Select, Upload, Button, Icon } from 'antd'
import { connect } from 'dva'
import styles from './index.css'

import { dataCategory } from '../../constants'

const Option = Select.Option;
const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 2 },
  wrapperCol: { span: 7 },
};
class UploadData extends Component {
  constructor (props) {
    super(props);
    this.state = {
      ...props

    }
  }

  handleSubmit = (e) => {
    const {history, match, dispatch} = this.props

    e.preventDefault();
    this.props.form.validateFields((err, values) => {

      if (!err) {
        // console.log(values);
        // let value = lodash.cloneDeep(values);
        // value.tags = this.props.upload.tags.join(',');
        dispatch({ type: 'upload/upload', payload: values })
        // history.push('preview')
      } else {

        console.log('error', err)
      }
    })
  };

  beforeUpload = (file) => {
    // console.log(file);
    // this.props.form.setFieldsValue({
    //   'upload': [file],
    // });
    return false

  };

  render() {
    const { getFieldDecorator } = this.props.form
    return (
      <div>
        <div className={styles.head}>
          Upload your file
        </div>

        <Form onSubmit={this.handleSubmit}>
          <FormItem
            { ...formItemLayout }
            label='File name'

          >
            {
              getFieldDecorator('data_set_name', {
                rules: [
                  { required: true, message: 'please enter name' },
                ],
              })(<Input />)
            }
          </FormItem>

          <FormItem
            { ...formItemLayout }
            label='Description'
          >
            {
              getFieldDecorator('description', {
                initialValue: name,
                rules: [
                  { required: true, message: 'Please enter description' },
                ],
              })(<Input.TextArea/>)
            }
          </FormItem>

          <FormItem
            { ...formItemLayout }
            label='Category'
          >
            {
              getFieldDecorator('related_field', {
                rules: [
                  { required: false },
                ],
              })(
                <Select>
                  {
                    dataCategory.map(e => <Option key={e} value={e}>{e}</Option>)
                  }
                </Select>
              )
            }

          </FormItem>


          <FormItem
            { ...formItemLayout }
            label='Tags'
          >
          </FormItem>

          <FormItem
            {...formItemLayout }
            label='Upload'
            extra="Please choose file"
            // fileList={this.state.fileList}
          >

            {getFieldDecorator('upload', {
              // valuePropName: 'fileList',
              rules: [
                { required: true, message: 'please choose file' },
              ],
            })(
              <Upload
                name="uploaded_file"
                action="/upload.do"
                beforeUpload={this.beforeUpload}
              >
                <Button>
                  <Icon type="upload"/> choose file
                </Button>
              </Upload>
            )}
          </FormItem>

          <FormItem
            wrapperCol={{ span: 12, offset: 2 }}
          >
            <Button type="primary" htmlType="submit" loading={this.props.upload.uploading}>Submit</Button>
          </FormItem>
        </Form>
      </div>
    )
  }
}


export default connect(({ upload }) => ({ upload }))(Form.create()(UploadData))
