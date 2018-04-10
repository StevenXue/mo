import React, {Component} from 'react'
import {Modal, Form, Input, Radio, Select, Tag, Tooltip, Button} from 'antd'
import {connect} from 'dva'
import _ from 'lodash'
import {
  createNewUserRequest,
  updateUserRequest,
} from '../../services/userRequest'
import {routerRedux} from 'dva/router'

const FormItem = Form.Item
const RadioButton = Radio.Button
const RadioGroup = Radio.Group
const Option = Select.Option
const { TextArea } = Input;

const fields = ['Business', 'Government', 'Education', 'Environment', 'Health', 'Housing & Development',
  'Public Services', 'Social', 'Transportation', 'Science', 'Technology']
const TYPE = ['app', 'module', 'dataset']

class RequestModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      visible: false,
      inputVisible: false,
    }
  }

  componentWillMount(){

  }

  showModelHandler = () => {
    this.props.dispatch({type: 'allRequest/showModal'})
  }

  hideModelHandler = () => {
    this.props.dispatch({type: 'allRequest/hideModal'})

  }

  okHandler = () => {
    const {form} = this.props
    form.validateFields((err, values) => {
      const body = {
        ...values,
        type: this.props.type,
        tags: this.props.allRequest.tags,
      }
      if (!err) {
        if (this.props.new) {
          createNewUserRequest({
            body,
            onJson: (response) => {
              this.props.fetchData && this.props.fetchData()
              this.props.dispatch({type: 'allRequest/hideModal'})
              this.props.dispatch(routerRedux.push('/userrequest/' + response._id +'?type='+this.props.type))
            },
          })
        } else {
          updateUserRequest({
            body,
            userRequestId: this.props.requestDetail._id,
            onJson: (response) => {
              this.props.fetchData && this.props.fetchData()
              this.props.dispatch({type: 'allRequest/hideModal'})
              this.props.dispatch({type: 'allRequest/fetchOneRequest',
                payload: {userrequestId: response._id}})
            },
          })
        }
      }
    })
  }

  handleClose(tags, removedTag) {
    tags = tags.filter(tag => tag !== removedTag).filter(e => e)
    this.setState({inputValue: undefined})
    this.props.dispatch({ type: 'allRequest/setTags', payload: tags })
  }

  showInput() {
    this.setState({inputVisible: true})
    // dispatch({ type: 'upload/showInput' })
  }

  handleInputChange(e) {
    this.setState({inputValue: e.target.value})
  }

  handleInputConfirm(tags) {
    if (this.state.inputValue && tags.indexOf(this.state.inputValue) === -1) {
      tags = [...tags, this.state.inputValue]
      this.setState({ inputValue: undefined, inputVisible: false })
      this.props.dispatch({ type: 'allRequest/setTags', payload: tags })
    }
  }

  render() {
    const {children, requestDetail,allRequest} = this.props
    const {getFieldDecorator} = this.props.form
    // const { name, description, privacy } = this.props.record
    const formItemLayout = {
      labelCol: {span: 6},
      wrapperCol: {span: 14},
    }

    let tags=[]
    let title, description, input, output
    if (requestDetail) {
      tags = allRequest.tags;
      ({ title, description, input, output }= requestDetail);
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
                })(<TextArea autosize={{ minRows: 3, maxRows: 20 }}/>)
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
                         afterClose={() => this.handleClose(tags, tag)}>
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
                    // onBlur={() => this.handleInputConfirm(tags)}
                    onPressEnter={() => this.handleInputConfirm(tags)}
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
