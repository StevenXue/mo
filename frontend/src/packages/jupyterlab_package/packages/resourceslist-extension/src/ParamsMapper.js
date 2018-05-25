import * as React from 'react'
import { Form, Select, Input, Tooltip, Icon, Table, Divider } from 'antd'
// import styles from './index.less'
import * as _ from 'lodash'

import '../style/ParamsMapper.css'

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
    span: 24,
  },
  wrapperCol: {
    span: 24,
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

const switchComponent = (arg, baseArg) => {
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

    // case 'img':
    //   return (
    //     <Demo setFieldsValue={setFieldsValue} keyName={arg.name}/>
    //   )

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

const formItems = (arg, i, getFieldDecorator, baseArg, key) => {
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
    <div className='parameter-row'>
      {
        getFieldDecorator(key, {
          initialValue: v || arg.default,
          // getValueFromEvent: (value) => splitHandler(value, arg.value_type, arg.value_range),
          rules: [
            {
              required: !arg.optional,
              // message: `need ${arg.value_type || ''}` + (arg.value_range ? ` in range ${arg.value_range}` : ''),
              ...validator(arg.value_type, arg.value_range),
            }, {
              pattern: typeParser(arg.value_type),
            },
          ],
        })(switchComponent(arg, baseArg))
      }
      <div className='parameter-help'>
        <Tooltip title={baseArg.des}>
          <Icon type="question-circle-o"/>
        </Tooltip>
      </div>
    </div>
  </FormItem>
}



function ParamsMapper({
                        args, baseArgs,
                        form: { getFieldDecorator },
                      }) {
  const data = Object.keys(args).map((key, i) => {
    let arg = args[key]
    arg.key = key
    return arg
  })
  return (
    <Form layout='inline'
          className='parameter-form'
          key={`params-form`}
    >
      <Table columns={columns} dataSource={data} pagination={false}/>
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
