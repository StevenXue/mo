import React, { Component } from 'react'
import { Modal, Form, Input, Button, Upload, Icon, Select, Tag } from 'antd'
import { connect } from 'dva'
import lodash from 'lodash'
import PropTypes from 'prop-types'
import { jupyterServer, flaskServer } from '../../../constants'

const FormItem = Form.Item
const Option = Select.Option
const fields = ['Business', 'Government', 'Education', 'Environment', 'Health', 'Housing & Development', 'Public' +
' Services',
  'Social', 'Transportation', 'Science', 'Technology'];
const tasks = ['Classification', 'Regression', 'Clustering', 'General Neural Network']

class FileModal extends Component {
  constructor (props) {
    super(props)
    this.state = {
      ...props.upload,
    }
  }

  // normFile = (e) => {
  //   console.log('Upload event:', e);
  //   if (Array.isArray(e)) {
  //     return e;
  //   }
  //   return e && e.fileList;
  // }

  showModelHandler = (e) => {
    if (e) e.stopPropagation()
    this.props.dispatch({ type: 'upload/showModal' })
  }

  hideModelHandler = () => {
    this.props.dispatch({ type: 'upload/hideModal' })
  }

  okHandler = (e) => {
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      if (!err) {
        let value = lodash.cloneDeep(values);
        value.tags = this.props.upload.tags.join(',');
        this.props.dispatch({ type: 'upload/upload', payload: value })
      } else {
        console.log('error', err)
      }
    })
  }

  beforeUpload = (file) => {
    console.log(file)
    this.props.form.setFieldsValue({
      'upload': [file],
    })
    // let reader = new FileReader();
    // reader.readAsDataURL(file);
    //
    // reader.onloadend = function () {
    // }.bind(this);

    //Prevent file uploading
    return false
  }

  render () {
    const { children } = this.props
    const { getFieldDecorator } = this.props.form
    const { name } = this.props.record
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    }
    const upload = this.props.upload
    const dispatch = this.props.dispatch
    function handleClose(removedTag){
      const tags = upload.tags.filter(tag => tag !== removedTag);
      console.log(tags);
      dispatch({type: 'upload/removeTag', payload: tags});
    }

    function showInput() {
      //this.setState({ inputVisible: true },);
      dispatch({ type: 'upload/showInput' })
    }
    function handleInputChange (e) {
      //this.setState({ inputValue: e.target.value });
      dispatch({ type: 'upload/setInputValue', payload: e.target.value })
    }

    function handleInputConfirm () {
      if(upload.inputValue && upload.tags.indexOf(upload.inputValue) === -1) {
        dispatch({ type: 'upload/confirmInput'})
      }
    }
    return (
      <span>
        <span onClick={this.showModelHandler}>
          {children}
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
               label="Name"
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
              {...formItemLayout}
              label="Description"
            >
              {
                getFieldDecorator('description', {
                  initialValue: name,
                  rules: [
                    { required: true, message: 'Please enter description' },
                  ],
                })(<Input/>)
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
                    <Icon type="upload"/> choose file
                  </Button>
                </Upload>,
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
                <Select>
                  <Option value="table">table</Option>
                  <Option value="image">image</Option>
                  <Option value="text">text</Option>
                  <Option value="audio">audio</Option>
                </Select>,
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
                <Select>
                  <Option value="false">public</Option>
                  <Option value="true">private</Option>
                </Select>,
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="Columns"
              extra="Column names for data, please split by ','"
            >
          {
            getFieldDecorator('names', {})(<Input/>)
          }
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="Fields"
            >
          {getFieldDecorator('related_field', {
            rules: [
              { required: false },
            ],
          })(
            <Select>
              {
                fields.map((e) => <Option value={e} key={e}>{e}</Option>)
              }
            </Select>,
          )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="Related Tasks"
            >
          {getFieldDecorator('related_tasks', {
            rules: [
              { required: false },
            ],
          })(
            <Select mode="multiple">
              {
                tasks.map((e) => <Option value={e} key={e}>{e}</Option>)
              }
            </Select>,
          )}
        </FormItem>
            <FormItem
              {...formItemLayout}
              label="Tags"
            >
          {
            getFieldDecorator('tags', {
              rules: [
                { required: false },
              ],
            })(
              <div>
                {upload.tags.length !== 0 && upload.tags.map((tag, index) => {
                  const isLongTag = tag.length > 20
                  const tagElem = (
                    <Tag key={tag} closable={true} afterClose={() => handleClose(tag)}>
                      {isLongTag ? `${tag.slice(0, 20)}...` : tag}
                    </Tag>
                  )
                  return isLongTag ? <Tooltip title={tag}>{tagElem}</Tooltip> : tagElem
                })}
                {upload.inputVisible && (
                  <Input
                    //ref={input => this.input = input}
                    type="text"
                    size="small"
                    style={{ width: 78 }}
                    value={upload.inputValue}
                    onChange={handleInputChange}
                    onBlur={handleInputConfirm}
                    onPressEnter={handleInputConfirm}
                  />
                )}
                {!upload.inputVisible && <Button size="small" type="dashed" onClick={showInput}>+ New Tag</Button>}
              </div>,
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
    )
  }
}

FileModal.propTypes = {
  form: PropTypes.object.isRequired,
  type: PropTypes.string,
  item: PropTypes.object,
  onOk: PropTypes.func,
}

export default connect(({ upload }) => ({ upload }))(Form.create()(FileModal))
