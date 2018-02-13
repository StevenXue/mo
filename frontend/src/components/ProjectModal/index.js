import React, { Component } from 'react'
import { Modal, Form, Input, Radio, Select, Tag, Tooltip, Button } from 'antd'
import { connect } from 'dva'
import { createProject, updateProject, getMyProjects, getProjects } from '../../services/project'

const FormItem = Form.Item
const RadioButton = Radio.Button
const RadioGroup = Radio.Group
const Option = Select.Option

const fields = ['Business', 'Government', 'Education', 'Environment', 'Health', 'Housing & Development',
  'Public Services', 'Social', 'Transportation', 'Science', 'Technology']
const tasks = ['Classification', 'Regression', 'Clustering', 'Reinforcement Learning']
const TYPE = ['app', 'module', 'dataset']

class ProjectModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      visible: false,
      privacy: 'private',
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

  okHandler = () => {
    const {form} = this.props
    form.validateFields((err, values) => {
      if (!err) {
        if (this.props.new) {
          createProject({
            body: values,
            onSuccess: () => {
              this.props.fetchData && this.props.fetchData()
              this.props.dispatch({ type: 'project/hideModal' })
            }
          })
        } else {
          updateProject({
            body: values,
            projectId: this.props.projectDetail.project._id,
            onSuccess: () => {
              this.props.fetchData && this.props.fetchData()
              this.props.dispatch({ type: 'project/hideModal' })
            }
          })
        }
      }
    })
  }

  onChangePrivacy(e) {
    this.setState({
      privacy: e.target.value,
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
    let name, description, type, privacy
    let tags = this.state.tags
    if (projectDetail) {
      ({ name, description, type, privacy } = projectDetail.project)
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
          <Form layout='horizontal' onSubmit={() => this.okHandler()}>
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
                })(<Input disabled={!this.props.new}/>)
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
              {getFieldDecorator('privacy', {
                initialValue: privacy,
                rules: [
                  { required: false },
                ],
              })(
                <RadioGroup onChange={(e) => this.onChangePrivacy(e)}>
                  <RadioButton value="private">Private</RadioButton>
                  <RadioButton value="public">Public</RadioButton>
                </RadioGroup>,
              )}

            </FormItem>}
            <FormItem
              {...formItemLayout}
              label="Project Type"
            >
          {getFieldDecorator('type', {
            initialValue: type,
            rules: [
              { required: true },
            ],
          })(
            <Select disabled={!this.props.new}>
              {
                TYPE.map((e) => <Option value={e} key={e}>{e}</Option>)
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
