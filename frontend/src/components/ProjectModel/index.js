import React, { Component } from 'react'
import { Modal, Form, Input, Radio, Select, Tag, Tooltip, Button } from 'antd'
import { connect } from 'dva'

const FormItem = Form.Item
const RadioButton = Radio.Button
const RadioGroup = Radio.Group
const Option = Select.Option

const fields = ['Business', 'Government', 'Education', 'Environment', 'Health', 'Housing & Development',
  'Public Services', 'Social', 'Transportation', 'Science', 'Technology']
const tasks = ['Classification', 'Regression', 'Clustering', 'Reinforcement Learning']

class ProjectModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      visible: false,
      is_private: 'true',
      tags: [],
      inputVisible: false,
    }
  }

  showModelHandler = (e) => {
    if (e) e.stopPropagation()
    // this.setState({
    //   visible: true,
    // });
    this.props.dispatch({ type: 'project/showModal' })
  }

  hideModelHandler = () => {
    // this.setState({
    //   visible: false,
    // });
    this.props.dispatch({ type: 'project/hideModal' })

  }

  okHandler = (values) => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        if (values.related_fields) {
          values.related_fields = values.related_fields.join(',')
        }
        if (values.related_tasks) {
          values.related_tasks = values.related_tasks.join(',')
        }
        // let body = {
        //   ...values,
        //   is_private: this.state.is_private,
        // }
        if (this.props.new) {
          this.props.dispatch({ type: 'project/create', body: values })
        } else {
          this.props.dispatch({ type: 'projectDetail/update', body: values })
        }
      }
    })
  }

  onChangePrivacy(e) {
    this.setState({
      is_private: e.target.value,
    })
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
      this.setState({ tags, inputValue: undefined, inputVisible: false })
    }

    // if (upload.inputValue && upload.tags.indexOf(upload.inputValue) === -1) {
    //   dispatch({ type: 'upload/confirmInput' })
    // }
  }

  render() {
    const { children, projectDetail } = this.props
    const { getFieldDecorator } = this.props.form
    // const { name, description, privacy } = this.props.record
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    }
    let name, description, related_fields, related_tasks, is_private
    let tags = this.state.tags
    if (projectDetail) {
      ({ name, description, related_fields, related_tasks, is_private } = projectDetail.project)
      is_private = String(is_private)
      tags = tags.length > 0 ? tags : projectDetail.project.tags
    }

    return (
      <span>
        <span onClick={this.showModelHandler}>
          {children}
        </span>
        <Modal
          title="Project Configuration"
          visible={this.props.project.modalVisible}
          onOk={this.okHandler}
          onCancel={this.hideModelHandler}
        >
          <Form layout='horizontal' onSubmit={() => this.okHandler(values)}>
            <FormItem
              {...formItemLayout}
              label="Project Name"
            >
              {
                getFieldDecorator('name', {
                  initialValue: name,
                  rules: [
                    {
                      required: true,
                    },
                  ],
                })(<Input/>)
              }
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="Description"
            >
              {
                getFieldDecorator('description', {
                  initialValue: description,
                  rules: [
                    {
                      required: true,
                    },
                  ],
                })(<Input/>)
              }
            </FormItem>
            {!this.props.new && <FormItem
              {...formItemLayout}
              label="Privacy"
            >
              {getFieldDecorator('is_private', {
                initialValue: is_private,
                rules: [
                  { required: false },
                ],
              })(
                <RadioGroup onChange={(e) => this.onChangePrivacy(e)}>
                  <RadioButton value="true">Private</RadioButton>
                  <RadioButton value="false">Public</RadioButton>
                </RadioGroup>,
              )}

            </FormItem>}
            <FormItem
              {...formItemLayout}
              label="Fields"
            >
          {getFieldDecorator('related_fields', {
            initialValue: related_fields,
            rules: [
              { required: false },
            ],
          })(
            <Select mode="multiple">
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
            initialValue: related_tasks,
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
              initialValue: tags,
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
              </div>,
            )}
            </FormItem>
          </Form>
        </Modal>
      </span>
    )
  }
}

export default connect(({ project }) => ({ project }))(Form.create()(ProjectModal))
