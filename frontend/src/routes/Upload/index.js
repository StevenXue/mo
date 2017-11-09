import React, { Component } from 'react'
import { Form, Input, Select, Upload, Button, Icon, Tag, Tooltip } from 'antd'
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
      ...props,
      tags: [],
      inputVisible: false,
    }
  }

  handleClose(removedTag) {
    const tags = this.state.tags.filter(tag => tag !== removedTag).filter(e => e)
    this.setState({ tags })
    // dispatch({ type: 'upload/removeTag', payload: tags })
  }

  showInput() {
    this.setState({ inputVisible: true })
    // dispatch({ type: 'upload/showInput' })
  }

  handleInputChange(e) {
    this.setState({ inputValue: e.target.value })
    // dispatch({ type: 'upload/setInputValue', payload: e.target.value })
  }

  handleInputConfirm() {
    if (this.state.inputValue && this.state.tags.indexOf(this.state.inputValue) === -1) {
      const tags = [...this.state.tags, this.state.inputValue]
      this.setState({tags, inputValue: undefined, inputVisible: false})
    }
  }

  handleSubmit = (e) => {
    const {history, match, dispatch} = this.props

    e.preventDefault();
    this.props.form.validateFields((err, values) => {

      if (!err) {
        console.log(values);

        dispatch({ type: 'upload/upload', payload: values })

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
    let tags = this.state.tags
    return (
      <div className={styles.whole}>

        <div className={styles.head}>
          Upload new file
        </div>

        <Form onSubmit={this.handleSubmit}>
          <FormItem
            { ...formItemLayout }
            label={<span className={styles.formItem}>File Name</span>}

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
            label={<span className={styles.formItem}>Description</span>}
          >
            {
              getFieldDecorator('description', {
                // initialValue: name,
                rules: [
                  { required: true, message: 'Please enter description' },
                ],
              })(<Input.TextArea/>)
            }
          </FormItem>

          <FormItem
            { ...formItemLayout }
            label={<span className={styles.formItem}>Category</span>}
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
            label={<span className={styles.formItem}>Tag</span>}
          >
            {
              getFieldDecorator('tags', {
                initialValue: tags.join(','),
                getValueFromEvent: (e) => {
                  return [...this.state.tags, e.target.value].join(',')
                },
                rules: [
                  { required: false },
                ],
              })(
                <div>
                  {tags.length !== 0 && tags.map((tag, index) => {
                    const isLongTag = tag.length > 15
                    const tagElem = (
                      <Tag key={tag} closable={true} afterClose={() => this.handleClose(tag)}>
                        {isLongTag ? `${tag.slice(0, 15)}...` : tag}
                      </Tag>
                    )
                    return isLongTag ? <Tooltip key={tag} title={tag}>{tagElem}</Tooltip> : tagElem
                  })}
                  {this.state.inputVisible ? (
                    <Input
                      //ref={input => this.input = input}
                      type="text"
                      size="small"
                      style={{ width: 78 }}
                      value={this.state.inputValue}
                      onChange={(e) => this.handleInputChange(e)}
                      onBlur={() => this.handleInputConfirm()}
                      onPressEnter={() => this.handleInputConfirm()}
                    />
                  ) : <Button size="small" type="dashed" onClick={() => this.showInput()}>+ New Tag</Button>}

                </div>
              )
            }
          </FormItem>

          <FormItem
            {...formItemLayout }
            label={<span className={styles.formItem}>Upload</span>}
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
