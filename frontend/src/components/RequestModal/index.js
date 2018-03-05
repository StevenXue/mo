import React, {Component} from 'react'
import {Modal, Form, Input, Radio, Select, Tag, Tooltip, Button} from 'antd'
import {connect} from 'dva'
import {
  createNewUserRequest,
  updateUserRequest,
} from '../../services/userRequest'
import {routerRedux} from 'dva/router'

const FormItem = Form.Item
const RadioButton = Radio.Button
const RadioGroup = Radio.Group
const Option = Select.Option

const fields = ['Business', 'Government', 'Education', 'Environment', 'Health', 'Housing & Development',
  'Public Services', 'Social', 'Transportation', 'Science', 'Technology']
const TYPE = ['app', 'module', 'dataset']

class RequestModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      visible: false,
      tags: [],
      inputVisible: false,
    }
  }

  componentWillMount(){

  }

  showModelHandler = (e) => {
    if (e) e.stopPropagation()
    // this.setState({
    //   visible: true,
    // });
    this.props.dispatch({type: 'allRequest/showModal'})
  }

  hideModelHandler = () => {
    // this.setState({
    //   visible: false,
    // });
    this.props.dispatch({type: 'allRequest/hideModal'})

  }

  okHandler = () => {
    const {form} = this.props
    form.validateFields((err, values) => {
      const body = {
        ...values,
        type: this.props.type,
        // tags: this.state.tags,
      }
      if (!err) {
        if (this.props.new) {
          createNewUserRequest({
            body,
            onJson: (response) => {
              this.props.fetchData && this.props.fetchData()
              this.props.dispatch({type: 'allRequest/hideModal'})
              this.props.dispatch(routerRedux.push('/userrequest/' + response._id))
            },
          })
        } else {
          updateUserRequest({
            body,
            userRequestId: this.props.requestDetail._id,
            onJson: () => {
              this.props.fetchData && this.props.fetchData()
              this.props.dispatch({type: 'allRequest/hideModal'})
              this.props.dispatch(routerRedux.push('/userrequest/' + response._id))
            },
          })
        }
      }
    })
  }

  handleClose(removedTag) {
    const tags = this.state.tags.filter(tag => tag !== removedTag).filter(e => e)
    this.setState({tags})
    // dispatch({ type: 'upload/removeTag', payload: tags })
  }

  showInput() {
    this.setState({inputVisible: true})
    // dispatch({ type: 'upload/showInput' })
  }

  handleInputChange(e) {
    console.log(this.state.inputValue)
    this.setState({inputValue: e.target.value})
    // dispatch({ type: 'upload/setInputValue', payload: e.target.value })
  }

  handleInputConfirm() {
    if (this.state.inputValue && this.state.tags.indexOf(this.state.inputValue) === -1) {
      // console.log(this.state.tags)
      const tags = [...this.state.tags, this.state.inputValue]
      // console.log(tags)
      this.setState({tags, inputValue: undefined, inputVisible: false})
    }

    // if (upload.inputValue && upload.tags.indexOf(upload.inputValue) === -1) {
    //   dispatch({ type: 'upload/confirmInput' })
    // }
  }

  render() {
    const {children, requestDetail} = this.props
    const {getFieldDecorator} = this.props.form
    // const { name, description, privacy } = this.props.record
    const formItemLayout = {
      labelCol: {span: 6},
      wrapperCol: {span: 14},
    }
    let title, description,  input, output
    let tags = this.state.tags
    if (requestDetail) {
      ({title, description, input, output } = requestDetail)
      tags = tags.length > 0 ? [...requestDetail.tags,...tags] : requestDetail.tags
    }
    return (
      <span>
        <span onClick={this.showModelHandler}>
          {children}
        </span>
        <Modal
          title="Request Configuration"
          visible={this.props.allRequest.modalVisible}
          onOk={this.okHandler}
          onCancel={this.hideModelHandler}
        >
          <Form layout='horizontal' onSubmit={() => this.okHandler()}>
            <FormItem
              {...formItemLayout}
              label="Title"
            >
              {
                getFieldDecorator('title', {
                  initialValue: title,
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
                      required: false,
                    },
                  ],
                })(<Input/>)
              }
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="Tags"
            >
          {
            getFieldDecorator('tags', {
              initialValue: tags,
              getValueFromEvent: (e) => {
                return [...tags, e.target.value]
              },
              rules: [
                {required: false},
              ],
            })(
              <div>
                {tags.length !== 0 && tags.map((tag, index) => {
                  const isLongTag = tag.length > 15
                  const tagElem = (
                    <Tag key={tag} closable={true}
                         afterClose={() => this.handleClose(tag)}>
                      {isLongTag ? `${tag.slice(0, 15)}...` : tag}
                    </Tag>
                  )
                  return isLongTag ?
                    <Tooltip key={tag} title={tag}>{tagElem}</Tooltip> : tagElem
                })}
                {this.state.inputVisible ? (
                  <Input
                    type="text"
                    size="small"
                    style={{width: 78}}
                    value={this.state.inputValue}
                    onChange={(e) => this.handleInputChange(e)}
                    onBlur={() => this.handleInputConfirm()}
                    onPressEnter={() => this.handleInputConfirm()}
                  />
                ) : <Button size="small" type="dashed"
                            onClick={() => this.showInput()}>+ New Tag</Button>}
              </div>,
            )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="Input"
            >
              {
                getFieldDecorator('input', {
                  initialValue: input,
                  rules: [
                    {
                      required: false,
                    },
                  ],
                })(<Input/>)
              }
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="Output"
            >
              {
                getFieldDecorator('output', {
                  initialValue: output,
                  rules: [
                    {
                      required: false,
                    },
                  ],
                })(<Input/>)
              }
            </FormItem>
          </Form>
        </Modal>
      </span>
    )
  }
}

export default connect(({allRequest}) => ({allRequest}))(Form.create()(RequestModal))
