import React from 'react'
import { Form, Button, Select, Input, Tooltip, Icon } from 'antd'
import styles from './index.less'

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

const switchComponent = (arg, baseArg) => {
  switch (arg.type) {
    case 'multiple_input':
    case 'input':
      return <Input/>

    case 'choice':
      return (
        <Select style={{ width: 142 }}>
          {
            arg.range.map((option) =>
              <Select.Option value={option} key={option}>{option}</Select.Option>,
            )
          }
        </Select>
      )

    case 'multiple_choice':
      return (
        <Select style={{ width: 142 }} mode='multiple'>
          {
            arg.range.map((option) =>
              <Select.Option value={option} key={option}>{option}</Select.Option>,
            )
          }
        </Select>
      )
    default:
      return <Input/>
  }
}

const formItems = (arg, i, getFieldDecorator, baseArg) => {

  let v
  if (arg.value || (arg.values && arg.values.length > 0)) {
    v = arg.value || arg.values
  }

  return <FormItem
    key={i}
    label={arg.display_name?arg.display_name:arg.name}
  >
    <div className={styles.row}>
      {
        getFieldDecorator(arg.name, {
          initialValue: v || arg.default,
          getValueFromEvent: (value) => splitHandler(value, arg.type, arg.value_type),
          rules: [
            {
              required: arg.required, message: `need ${arg.value_type || ''} ${arg.type}`,
              type: typeParser(arg.type, arg.value_type),
            },
          ],
        })(switchComponent(arg, baseArg))
      }
      <div className={styles.help}>
        <Tooltip title={baseArg.des}>
          <Icon type="question-circle-o"/>
        </Tooltip>
      </div>
    </div>
  </FormItem>
}

function ParamsMapper({
                        args, layerIndex, baseArgs,
                        form: { getFieldDecorator },
                      }) {

  return (
    <Form layout='inline' className={styles.form}
          key={`params-form-${layerIndex}`}
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
