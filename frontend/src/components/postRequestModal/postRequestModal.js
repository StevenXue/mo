import {Modal, Button, Input, Form, notification, Select, Tag, Tooltip, Icon } from 'antd'
import styles from './postRequestModal.less'
import React from 'react'
import {connect} from 'dva'
import debounce from 'lodash.debounce'
import jsonp from 'fetch-jsonp';
import querystring from 'querystring';
import {routerRedux} from 'dva/router'

const Option = Select.Option;

const {TextArea} = Input
const FormItem = Form.Item
import {get} from 'lodash'
import { dataCategory } from '../../constants'

let timeout;
let currentValue;


// 获取 相似的title
function fetch(value, callback) {
  if (timeout) {
    clearTimeout(timeout);
    timeout = null;
  }
  currentValue = value;

  function fake() {
    const str = querystring.encode({
      code: 'utf-8',
      q: value,
    });
    jsonp(`https://suggest.taobao.com/sug?${str}`)
      .then(response => response.json())
      .then((d) => {
        if (currentValue === value) {
          const result = d.result;
          const data = [];
          result.forEach((r) => {
            data.push({
              value: r[0],
              text: r[0],
            });
          });
          callback(data);
        }
      });
  }

  timeout = setTimeout(fake, 300);
}


function hasErrors(fieldsError) {
  return Object.keys(fieldsError).some(field => fieldsError[field])
}

class PostRequestModal extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      ...props,
      // tags 使用
      tags: [],
      inputVisible: false,
      inputValue: '',
      // title 使用
      data:[],
      searchvalue:'',
    }
  }

  makeNewRequest = (values) => {
    this.props.dispatch({
      type: 'allRequest/makeNewRequest',
      payload: {
        requestTitle: values['requestTitle'],
        requestDescription: values['requestDescription'],
        requestDataset: values['requestDataset'],
        requestInput: values['requestInput'],
        requestOutput: values['requestOutput'],
        requestTags: values['requestTags'],
        requestCategory: values['requestCategory'],
      }
    })
  }

  componentDidMount() {
    // To disabled submit button at the beginning.
    this.props.form.validateFields()
  }

  showModal = (modalState) => {
    this.props.dispatch({
      type: 'allRequest/showModal',
      payload: {modalState: modalState},
    })
  }

  handleOk = (e) => {
    console.log(e)
    this.setState({
      visible: false,
    })
  }


  handleChange = (searchvalue) => {
    this.setState({ searchvalue });
    fetch(searchvalue, data => this.setState({ data }));
  }

  handleChooseRequest = (e) => {
    console.log(e)
    this.props.dispatch(routerRedux.push('/userrequest'))
  }



  handleCancel = (e) => {
    console.log(e)
    this.props.dispatch({
      type: 'allRequest/showModal',
      payload: {modalState: false},
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
      this.setState({tags, inputValue: undefined, inputVisible: false})
    }
  }

  handleSubmit = (e) => {
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values)
        this.showModal(false)
        this.makeNewRequest(values)
      }
    })
  }

  initialValue = (deployInfo) => {
    return null
  }


  render() {
    const {getFieldDecorator, getFieldsError, getFieldError, isFieldTouched} = this.props.form
    const inputFieldError = isFieldTouched('inputField') && getFieldError('inputField')
    let tags = this.state.tags
    let options = this.state.data.map(d => <Option key={d.value}>{d.text}</Option>);


    return (
      <div>
        <Modal
          // title="hh"
          visible={this.props.visible}
          // onOk={this.handleOk}
          onCancel={this.handleCancel}
          footer={null}
        >
          <h1>Write down your request</h1>
          <h2>It's easier for others to help with more information you
            provide</h2>
          <br/>
          <Form onSubmit={this.handleSubmit}>
            <h2>Title</h2>
            <FormItem
              validateStatus={inputFieldError ? 'error' : ''}
              help={inputFieldError || ''}
            >
              {
                getFieldDecorator('requestTitle', {
                  initialValue: this.state.searchvalue,
                  rules: [
                    { required: true },
                  ],
                })(
            <Select
              mode="combobox"
              placeholder={this.props.placeholder}
              style={this.props.style}
              defaultActiveFirstOption={false}
              showArrow={false}
              filterOption={false}
              onChange={this.handleChange}
              onSelect={this.handleChooseRequest}
            >
              {options}
            </Select>
                )
              }
            </FormItem>


            {/*<h2>Title</h2>*/}
            {/*<FormItem*/}
              {/*validateStatus={inputFieldError ? 'error' : ''}*/}
              {/*help={inputFieldError || ''}*/}
            {/*>*/}
              {/*{getFieldDecorator('requestTitle', {*/}
                {/*initialValue: this.initialValue("requestTitle"),*/}
                {/*rules: [{*/}
                  {/*required: true,*/}
                  {/*message: 'Title is missing'*/}
                {/*}],*/}
              {/*})(*/}
                {/*<Input className={styles.inputtext}*/}
                       {/*placeholder="What's your request?Be specific"*/}
                {/*/>*/}
              {/*)}*/}
            {/*</FormItem>*/}

            <h2>Category (Optional)</h2>
            <FormItem
              validateStatus={inputFieldError ? 'error' : ''}
              help={inputFieldError || ''}
            >
              {
                getFieldDecorator('requestCategory', {
                  rules: [
                    { required: false },
                  ],
                })(
                  <Select mode="multiple">
                    {
                      dataCategory.map(e => <Option key={e} value={e}>{e}</Option>)
                    }
                  </Select>
                )
              }

            </FormItem>

            <FormItem validateStatus={inputFieldError ? 'error' : ''}
                      help={inputFieldError || ''}
            >
              {
                getFieldDecorator('requestTags', {
                  initialValue: tags.join(','),
                  getValueFromEvent: (e) => {
                    return [...this.state.tags, e.target.value].join(',')
                  },
                  rules: [
                    { required: false },
                  ],
                })(
                  <div>
                    <h2>Tag (Optional)</h2>
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

            <h2>Description (Optional)</h2>
            <FormItem
              validateStatus={inputFieldError ? 'error' : ''}
              help={inputFieldError || ''}
            >
              {getFieldDecorator('requestDescription', {
                initialValue: this.initialValue('requestDescription'),
                rules: [{
                  required: false,
                  message: 'hello'
                }],
              })(
                <TextArea className={styles.inputtext}
                          autosize={{minRows: 4, maxRows: 50}}
                          placeholder="Provide a complete description of your request"
                />
              )}
            </FormItem>
            <h2>Input (Optional)</h2>
            <FormItem
              validateStatus={inputFieldError ? 'error' : ''}
              help={inputFieldError || ''}
            >
              {getFieldDecorator('requestInput', {
                initialValue: this.initialValue('requestInput'),
                rules: [{
                  required: false,
                  message: 'hello'
                }],
              })(
                <TextArea className={styles.inputtext}
                          autosize={{minRows: 2, maxRows: 50}}
                          placeholder="Define your input"
                />
              )}
            </FormItem>
            <h2>Output (Optional)</h2>
            <FormItem
              validateStatus={inputFieldError ? 'error' : ''}
              help={inputFieldError || ''}
            >
              {getFieldDecorator('requestOutput', {
                initialValue: this.initialValue('requestOutput'),
                rules: [{
                  required: false,
                  message: 'hello'
                }],
              })(
                <TextArea className={styles.inputtext}
                          autosize={{minRows: 2, maxRows: 50}}
                          placeholder="Define your output"
                />
              )}
            </FormItem>
            <h2>Dataset (Optional)</h2>
            <FormItem
              validateStatus={inputFieldError ? 'error' : ''}
              help={inputFieldError || ''}
            >
              {getFieldDecorator('requestDataset', {
                initialValue: this.initialValue('requestDataset'),
                rules: [{
                  required: false,
                  message: 'hello'
                }],
              })(
                <TextArea className={styles.inputtext}
                          autosize={{minRows: 2, maxRows: 50}}
                          placeholder="URL to your dataset"
                />
              )}
            </FormItem>
            <FormItem>
              <Button
                type="primary"
                htmlType="submit"
                disabled={hasErrors(getFieldsError())}
              >
                {'Post your request'}
              </Button>
            </FormItem>
          </Form>
        </Modal>
      </div>
    )
  }
}

const WrappedPostRequestModal = Form.create()(PostRequestModal)
connect(({allRequest}) => ({allRequest}))(WrappedPostRequestModal)
export default WrappedPostRequestModal
