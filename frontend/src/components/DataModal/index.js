import React, { Component } from 'react'
import { Modal, Form, Input, Radio, Select, Tag, Tooltip, Button } from 'antd'
import { connect } from 'dva'
import styles from './index.less'

import { dataCategory } from '../../constants'

const FormItem = Form.Item
const Option = Select.Option

class DataModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      visible: false,
      tags: [],
      inputVisible: false,
    }
  }

  showModelHandler = (e) => {
    if (e) e.stopPropagation()
    console.log(this.state.tags.join(','))
    console.log(this.props.upload.dataSetTags)
    this.props.dispatch({ type: 'upload/showModal' })
  }

  hideModelHandler = () => {
    this.props.dispatch({ type: 'upload/hideModal' })

  }

  okHandler = () => {
    const {dispatch} = this.props
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log(values);
        dispatch({type:'upload/editStaged', payload:values})
      } else {
        console.log('err', err)
      }
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

  }

  render() {
    const { children } = this.props
    const { getFieldDecorator } = this.props.form
    const {dataSetName, dataSetDesc, dataSetTags, dataSetField} = this.props.upload
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    }

    let tags = this.state.tags
    return (
      <span>
        <span onClick={this.showModelHandler}>
          {children}
        </span>
        <Modal
          title="Staging Data Infomation"
          visible={this.props.upload.modalVisible}
          onOk={this.okHandler}
          onCancel={this.hideModelHandler}
          confirmLoading={this.props.upload.editLoading}
        >
          <Form onSubmit={this.okHandler}>
            <FormItem
              { ...formItemLayout }
              label={<span className={styles.formItem}>Name</span>}
            >
            {
              getFieldDecorator('name', {
                initialValue: dataSetName,
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
                  initialValue: dataSetDesc,
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
                  initialValue: dataSetField,
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
                  initialValue: dataSetTags.join(','),
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
          </Form>
        </Modal>
      </span>
    )
  }
}

export default connect(({ upload }) => ({ upload }))(Form.create()(DataModal))
