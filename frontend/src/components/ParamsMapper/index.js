import React from 'react'
import {Form, Button, Select, Input, Tooltip, Icon, Upload, Modal} from 'antd'
import styles from './index.less'
import {runApi} from '../../services/app'
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

const typeParser = (type, valueType) => {
  const typeDict = {
    int: 'integer',
    float: 'number',
    str: 'string',
    bool: 'boolean',
  }

  switch (type) {
    case 'multiple_input':
      return 'array'
    case 'multiple_choice':
      return 'array'
    case 'input':
      return typeDict[valueType]
    default:
      return 'string'
  }
}

const splitHandler = (e, type, valueType) => {
  switch (type) {
    case 'multiple_input':
      const splitValue = e.target.value.split(',')
      // FIXME
      if (splitValue.includes('')) {
        return e.target.value
      } else {
        try {
          return splitValue.map(e => parse(e, valueType))
        } catch (err) {
          return e.target.value
        }
      }
    case 'input':
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

const switchComponent = (arg, baseArg, setFieldsValue ) => {
  switch (arg.type) {
    case 'multiple_input':
    case 'input':
      return <Input/>

    case 'choice':
      return (
        <Select style={{width: 142}}>
          {
            arg.range.map((option) =>
              <Select.Option value={option}
                             key={option}>{option}</Select.Option>,
            )
          }
        </Select>
      )

    case 'multiple_choice':
      return (
        <Select style={{width: 142}} mode='multiple'>
          {
            arg.range.map((option) =>
              <Select.Option value={option}
                             key={option}>{option}</Select.Option>,
            )
          }
        </Select>
      )

    case 'upload':
      return (
        <Demo setFieldsValue={setFieldsValue} key1={arg.name}/>
      )

    default:
      return <Input/>
  }
}

const formItems = (arg, i, getFieldDecorator, baseArg, setFieldsValue ) => {
  console.log('arg',arg)
  let v
  if (arg.value || (arg.values && arg.values.length > 0)) {
    v = arg.value || arg.values
  }

  return <FormItem
    key={i}
    label={arg.display_name ? arg.display_name : arg.name}
    help={`Need ${arg.value_type}`}
    {...formItemLayout}
  >
    <div className={styles.row}>
      {
        getFieldDecorator(arg.name, {
          initialValue: v || arg.default,
          getValueFromEvent: (value) => splitHandler(value, arg.type, arg.value_type),
          rules: [
            {
              required: arg.required,
              message: `need ${arg.value_type || ''} ${arg.type}`,
              type: typeParser(arg.type, arg.value_type),
            },
          ],
        })(switchComponent(arg, baseArg, setFieldsValue ))
      }
      <div className={styles.help}>
        <Tooltip title={baseArg.des}>
          <Icon type="question-circle-o"/>
        </Tooltip>
      </div>
    </div>
  </FormItem>
}

const handleSubmit = (e, validateFieldsAndScroll, appId, dispatch) => {

  e.preventDefault()
  validateFieldsAndScroll((err, values) => {
    console.log('llllllll',values)
    if (!err) {
      console.log('Received values of form: ', values)
      let payload = {'app': {'input': values}}
      payload['app_id'] = appId
      dispatch({type: 'projectDetail/get_example_result', payload: payload})
    }
  })
}
const formItemLayout = {
  labelCol: {
    xs: {span: 24},
    sm: {span: 6},
  },
  wrapperCol: {
    xs: {span: 24},
    sm: {span: 14},
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

  handleCancel = () => this.setState({previewVisible: false})

  handlePreview = (file) => {
    this.setState({
      previewImage: file.url || file.thumbUrl,
      previewVisible: true,
    })
  }

  handleChange = ({fileList}) => {
    let thisFile = fileList[0]
    getBase64(thisFile, imageUrl => {
      let newList = [{originFileObj: thisFile,thumbUrl: imageUrl,uid:thisFile.uid}]
      this.setState({
        fileList:newList,
        loading: false,
      })
      this.props.setFieldsValue({[this.props.key1]:newList[0].thumbUrl})
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
        this.setState(({fileList}) => {
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
              style={{width: '100%'}}
              src={this.state.previewImage}
            />
          </Modal>
        </div>
      </div>
    )
  }
}


function ParamsMapper({
                        args, layerIndex, baseArgs, appId, dispatch,
                        form: {getFieldDecorator, validateFieldsAndScroll, setFieldsValue },
                      }) {

  return (
    <Form layout='horizontal' className={styles.form}
          key={`params-form-${layerIndex}`}
          onSubmit={(value) => handleSubmit(value, validateFieldsAndScroll, appId, dispatch)}
    >
      {
        args.map((arg, i) => {
          return formItems(arg, i, getFieldDecorator, baseArgs[i], setFieldsValue )
        })
      }
      <FormItem wrapperCol={{span: 12, offset: 11}}>
        <Button
          type="primary" htmlType="submit">Submit</Button>
      </FormItem>
    </Form>
  )
}

const handleValuesChange = ({setValue}, values) => {
  setValue(values)
}

export default Form.create({onValuesChange: (props, values) => handleValuesChange(props, values)})(ParamsMapper)
export {
  formItems,
}
