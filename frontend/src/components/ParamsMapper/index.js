import React from 'react'
import { Form, Button, Select, Input, Tooltip, Icon, Upload, Modal } from 'antd'
import styles from './index.less'
import { runApi } from '../../services/app'
// import reqwest from 'reqwest'

const FormItem = Form.Item

function getArgs(baseSteps, stepIndex, argIndex) {

  if (argIndex !== undefined) {
    return baseSteps[stepIndex].args[argIndex]
  } else {
    return baseSteps[stepIndex]
  }

}

const valueParser = {
  int: (e) => parseInt(e),
  float: (e) => parseFloat(e),
  bool: (e) => e.toLowerCase() === 'true',
  str: (e) => (e),
}

const parse = (e, valueType) => {
  let parsed = valueParser[valueType](e)
  if (isNaN(parsed) || String(parsed).toLowerCase() !== e.toLowerCase()) {
    return e
  } else {
    return parsed
  }
}

const typeParser = (valueType) => {

  switch (valueType) {
    case '[int]':
    case '[str]':
    case '[float]':
      return 'array'
    case 'str':
      return 'string'
    case 'int':
      return 'integer'
    case 'float':
      return 'float'
    default:
      return 'string'
  }
}

const splitHandler = (e, valueType, valueRange) => {
  if (Array.isArray(valueRange)) {
    // choice or multiple_choice
    return e
  } // others are input or upload
  switch (valueType) {
    case '[int]':
    case '[str]':
    case '[float]':
      const splitValue = e.target.value.split(',')
      // FIXME
      if (splitValue.includes('')) {
        return e.target.value
      } else {
        try {
          return splitValue.map(e => parse(e, valueType.replace('[', '').replace(']', '')))
        } catch (err) {
          return e.target.value
        }
      }
    case 'str':
    case 'int':
    case 'float':
      try {
        return parse(e.target.value, valueType)
      } catch (err) {
        console.log(err, e.target.value)
        return e.target.value
      }
    default:
      // choice or multiple_choice
      return e
  }
}

const switchComponent = (arg, baseArg, setFieldsValue) => {
  switch (arg.value_type) {
    case '[int]':
    case '[str]':
    case '[float]':
      if (Array.isArray(arg.value_range)) {
        return (
          <Select style={{ width: 142 }} mode='multiple'>
            {
              arg.value_range.map((option) =>
                <Select.Option value={option}
                               key={option}>{option}</Select.Option>,
              )
            }
          </Select>
        )
      }
      return <Input/>
    case 'str':
    case 'int':
    case 'float':
      if (Array.isArray(arg.value_range)) {
        return (
          <Select style={{ width: 142 }}>
            {
              arg.value_range.map((option) =>
                <Select.Option value={option}
                               key={option}>{option}</Select.Option>,
              )
            }
          </Select>
        )
      }
      return <Input/>

    case 'img':
      return (
        <Demo setFieldsValue={setFieldsValue} keyName={arg.name}/>
      )

    default:
      return <Input/>
  }
}

const validator = (type, range) => {
  if (!range || Array.isArray(range)) {
    return {}
  }
  let l, h
  if (range.includes('-')) {
    [l, h] = range.split('-').map(e=> parseFloat(e.replace(/\s/g,'')))
  } else if (range.includes('>=')) {
    l = range.split('>=').map(e=> parseFloat(e.replace(/\s/g,''))).slice(-1)[0]
  } else if (range.includes('<=')) {
    h = range.split('>=').map(e=> parseFloat(e.replace(/\s/g,''))).slice(-1)[0]
  }
  switch (type) {
    case '[int]':
    case '[str]':
    case '[float]':
      return {
        validator: (rule, value, callback) => {
          if (Array.isArray(value) && value.every(e => (!h || e <= h) && (!l || e >= l))) {
            callback()
          } else {
            callback('range error')
          }
        },
      }

    case 'str':
    case 'int':
    case 'float':
      return {
        validator: (rule, value, callback) => {
          console.log(111, rule, value)
          if ((!h || value <= h) && (!l || value >= l)) {
            callback()
          } else {
            callback('range error')
          }
        },
      }

    case 'img':
      return {}

    default:
      return {}
  }
}

const formItems = (arg, i, getFieldDecorator, baseArg, setFieldsValue) => {
  console.log('arg', arg)
  let v
  if (arg.value || (arg.values && arg.values.length > 0)) {
    v = arg.value || arg.values
  }

  return <FormItem
    key={i}
    label={arg.display_name ? arg.display_name : arg.name}
    help={`need ${arg.value_type || ''}` + (arg.value_range ? ` in range ${arg.value_range}` : '')}
    {...formItemLayout}
  >
    <div className={styles.row}>
      {
        getFieldDecorator(arg.name, {
          initialValue: v || arg.default,
          getValueFromEvent: (value) => splitHandler(value, arg.value_type, arg.value_range),
          rules: [
            {
              required: !arg.optional,
              // message: `need ${arg.value_type || ''}` + (arg.value_range ? ` in range ${arg.value_range}` : ''),
              type: typeParser(arg.value_type),
              ...validator(arg.value_type, arg.value_range),
            },
          ],
        })(switchComponent(arg, baseArg, setFieldsValue))
      }
      <div className={styles.help}>
        <Tooltip title={baseArg.des}>
          <Icon type="question-circle-o"/>
        </Tooltip>
      </div>
    </div>
  </FormItem>
}

const handleSubmit = (e, validateFieldsAndScroll, appId, dispatch, version) => {

  e.preventDefault()
  validateFieldsAndScroll((err, values) => {
    if (!err) {
      console.log('Received values of form: ', values)
      let payload = { 'app': { 'input': values } }
      payload['app_id'] = appId
      payload.version = version
      dispatch({ type: 'projectDetail/getExampleResult', payload: payload })
    }
  })
}
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 14 },
  },
}

function getBase64(img, callback) {
  const reader = new FileReader()
  reader.addEventListener('load', () => callback(reader.result))
  reader.readAsDataURL(img)
}

class Demo extends React.Component {
  state = {
    loading: false,
    previewVisible: false,
    fileList: [],
  }

  handleCancel = () => this.setState({ previewVisible: false })

  handlePreview = (file) => {
    this.setState({
      previewImage: file.url || file.thumbUrl,
      previewVisible: true,
    })
  }

  handleChange = ({ fileList }) => {
    let thisFile = fileList[0]
    getBase64(thisFile, imageUrl => {
      let newList = [{ originFileObj: thisFile, thumbUrl: imageUrl, uid: thisFile.uid }]
      this.setState({
        fileList: newList,
        loading: false,
      })
      this.props.setFieldsValue({ [this.props.keyName]: newList[0].thumbUrl })
    })
  }

  render() {
    console.log(this.props)
    const uploadButton = (
      <div>
        <Icon type={this.state.loading ? 'loading' : 'plus'}/>
        <div className="ant-upload-text">Upload</div>
      </div>
    )
    const props = {
      onRemove: (file) => {
        this.setState(({ fileList }) => {
          const index = fileList.indexOf(file)
          const newFileList = fileList.slice()
          newFileList.splice(index, 1)
          return {
            fileList: newFileList,
          }
        })
      },
      beforeUpload: (file) => {
        return false
      },
      fileList: this.state.fileList,
    }
    return (
      <div style={styles.ImageContainer}>
        <div style={styles.image}>
          <Upload {...props}
                  className="upload-pic"
                  action={URL + '/fake_upload'}
                  listType="picture-card"
                  fileList={this.state.fileList}
                  onPreview={this.handlePreview}
                  onChange={this.handleChange}
          >
            {this.state.fileList.length >= 1 ? null : uploadButton}
          </Upload>
          <Modal
            visible={this.state.previewVisible}
            footer={null}
            onCancel={this.handleCancel}
          >
            <img
              alt="example"
              style={{ width: '100%' }}
              src={this.state.previewImage}
            />
          </Modal>
        </div>
      </div>
    )
  }
}

function ParamsMapper({
                        args, layerIndex, baseArgs, appId, dispatch, version,
                        form: { getFieldDecorator, validateFieldsAndScroll, setFieldsValue },
                      }) {

  return (
    <Form layout='horizontal' className={styles.form}
          key={`params-form-${layerIndex}`}
          onSubmit={(value) => handleSubmit(value, validateFieldsAndScroll, appId, dispatch, version)}
    >
      {
        args.map((arg, i) => {
          return formItems(arg, i, getFieldDecorator, baseArgs[i], setFieldsValue)
        })
      }
      <FormItem wrapperCol={{ span: 12, offset: 11 }}>
        <Button
          type="primary" htmlType="submit">Submit</Button>
      </FormItem>
    </Form>
  )
}

const handleValuesChange = ({ setValue }, values) => {
  setValue(values)
}

export default Form.create({ onValuesChange: (props, values) => handleValuesChange(props, values) })(ParamsMapper)
export {
  formItems,
}
