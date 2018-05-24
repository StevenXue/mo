import React from 'react'
import { Form, Button, Select, Input, Tooltip, Icon, Upload, Modal } from 'antd'
import styles from './index.less'
import _ from 'lodash'
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

const formItemLayout = {
  labelCol: {
    span: 24
  },
  wrapperCol: {
    span: 24
  },
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
  const STR_EXP = '\\S+'
  const INT_EXP = '[+-]?\\d+'
  const FLOAT_EXP = '[+-]?\\d+(.\\d+)?'
  switch (valueType) {
    case '[int]':
      return new RegExp(`^([ ]*${INT_EXP}[ ]*)([ ]*,[ ]*${INT_EXP}[ ]*)*$`)
    case '[str]':
      return new RegExp(`^([ ]*${STR_EXP}[ ]*)([ ]*,[ ]*${STR_EXP}[ ]*)*$`)
    case '[float]':
      return new RegExp(`^([ ]*${FLOAT_EXP}[ ]*)([ ]*,[ ]*${FLOAT_EXP}[ ]*)*$`)
    case 'str':
      return new RegExp(`^${STR_EXP}$`)
    case 'int':
      return new RegExp(`^${INT_EXP}$`)
    case 'float':
      return new RegExp(`^${FLOAT_EXP}$`)
    default:
      return new RegExp(`^${STR_EXP}$`)
  }
}

const splitHandler = (value, valueType, valueRange) => {
  console.log(value, valueType, valueRange)
  if (Array.isArray(valueRange)) {
    // choice or multiple_choice
    return value
  } // others are input or upload
  switch (valueType) {
    case '[int]':
    case '[str]':
    case '[float]':
      const splitValue = value.split(',')
      // FIXME
      if (splitValue.includes('')) {
        return value
      } else {
        try {
          return splitValue.map(e => parse(_.trim(e), valueType.replace('[', '').replace(']', '')))
        } catch (err) {
          return value
        }
      }
    case 'str':
    case 'int':
    case 'float':
      try {
        return parse(_.trim(value), valueType)
      } catch (err) {
        return value
      }
    default:
      // choice or multiple_choice
      return value
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
    [l, h] = range.split('-').map(e => parseFloat(e.replace(/\s/g, '')))
  } else if (range.includes('>=')) {
    l = range.split('>=').map(e => parseFloat(e.replace(/\s/g, ''))).slice(-1)[0]
  } else if (range.includes('<=')) {
    h = range.split('<=').map(e => parseFloat(e.replace(/\s/g, ''))).slice(-1)[0]
  }
  switch (type) {
    case '[int]':
    case '[str]':
    case '[float]':
      return {
        validator: (rule, value, callback) => {
          value = splitHandler(value, type, range)
          console.log(value, range, h, l)
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
          value = splitHandler(value, type, range)
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

const formItems = (arg, i, getFieldDecorator, baseArg, setFieldsValue, key) => {
  console.log('arg', arg)
  let v
  if (arg.value || (arg.values && arg.values.length > 0)) {
    v = arg.value || arg.values
  }

  return <FormItem
    key={key}
    className='example-form-item'
    label={key}
    help={`need ${arg.value_type || ''}` + (arg.value_range ? ` in range ${arg.value_range}` : '')}
    {...formItemLayout}
  >
    <div className={styles.row}>
      {
        getFieldDecorator(key, {
          initialValue: v || arg.default,
          // getValueFromEvent: (value) => splitHandler(value, arg.value_type, arg.value_range),
          rules: [
            {
              required: !arg.optional,
              // message: `need ${arg.value_type || ''}` + (arg.value_range ? ` in range ${arg.value_range}` : ''),
              ...validator(arg.value_type, arg.value_range),
            },{
              pattern: typeParser(arg.value_type),
            }
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

const handleSubmit = (e, validateFieldsAndScroll, appId, dispatch, version, args) => {
  e.preventDefault()
  validateFieldsAndScroll((err, values) => {
    if (!err) {
      console.log('Received values of form: ', values)
      console.log('arg', args)
      for (let key in values) {
        if (values.hasOwnProperty(key) && args.hasOwnProperty(key)) {
          const obj = args[key]
          values[key] = splitHandler(values[key], obj.value_type, obj.value_range)
        }
      }
      let payload = { 'app': { 'input': values } }
      payload['app_id'] = appId
      payload.version = version
      dispatch({ type: 'projectDetail/getExampleResult', payload: payload })
    }
  })
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
                        args, layerIndex, baseArgs, appId, dispatch, version, resultLoading,
                        form: { getFieldDecorator, validateFieldsAndScroll, setFieldsValue },
                      }) {

  return (
    <Form layout='horizontal' className={styles.form}
          key={`params-form-${layerIndex}`}
          onSubmit={(value) => handleSubmit(value, validateFieldsAndScroll, appId, dispatch, version, args)}
    >
      {
        Object.keys(args).map((key, i) => {
          const arg = args[key]
          return formItems(arg, i, getFieldDecorator, baseArgs[key], setFieldsValue, key)
        })
      }
      <FormItem wrapperCol={{ span: 6, offset: 5 }}>
        <Button loading={resultLoading}
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
