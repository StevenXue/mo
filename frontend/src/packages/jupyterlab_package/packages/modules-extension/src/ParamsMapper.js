import * as React from 'react'
import { Form, Select, Input, Tooltip, Icon } from 'antd'
// import styles from './index.less'
import '../style/ParamsMapper.css'

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
    h = range.split('>=').map(e => parseFloat(e.replace(/\s/g, ''))).slice(-1)[0]
  }
  switch (type) {
    case '[int]':
    case '[str]':
    case '[float]':
      return {
        validator: (rule, value, callback) => {
          console.log(111, rule, value)
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
    key={arg.display_name ? arg.display_name : arg.name}
    label={arg.display_name ? arg.display_name : arg.name}
    help={`need ${arg.value_type || ''}` + (arg.value_range ? ` in range ${arg.value_range}` : '')}
  >
    <div className='parameter-row'>
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
  return (
    <Form layout='inline' className='parameter-form'
          key={`params-form`}
    >
      {
        args.map((arg, i) => {
          return formItems(arg, i, getFieldDecorator, baseArgs[i])
        })
      }
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
