import React from 'react'
import { Form, Button, Select, Input } from 'antd'
import styles from './index.less'

const FormItem = Form.Item

function ParamsMapper({
                        args,
                        layerIndex,
                        layers,
                        value,
                        form: {
                          getFieldValue,
                          getFieldsValue,
                          getFieldDecorator,
                          validateFields,
                        },

                      }) {

  const valueParser = {
    int: (e) => parseInt(e),
    float: (e) => parseFloat(e),
    str: (e) => (e),
  }

  const splitHandler = (e, type, valueType) => {
    switch (type) {
      case 'multiple_input':
        const splitValue = e.target.value.split(',')
        // FIXME
        if (splitValue.includes('')) {
          return e.target.value
        } else {
          return e.target.value.split(',').map(e => {
            return valueParser[valueType](e)
          })
        }
      case 'input':
        return valueParser[valueType](e.target.value)
      default:
        return e
    }
  }

  const switchComponent = (arg) => {
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

  return (
    <Form layout='inline' className={styles.form}
          key={`params-form-${layerIndex}`}
      // onSubmit={handleSubmit}
    >
      {
        args.map((arg, i) => <FormItem
          key={i}
          label={arg.display_name}
          // className={styles.item}
        >
          {
            getFieldDecorator(arg.name, {
              initialValue: arg.default,
              getValueFromEvent: (value) => splitHandler(value, arg.type, arg.value_type),
              rules: [
                { required: arg.required, message: arg.des },
              ],
            })(switchComponent(arg))
          }
        </FormItem>)
      }
    </Form>
  )
}

const handleValuesChange = (props, values) => {

  // updateLayerArgs(values)
}

export default Form.create({ onValuesChange: (props, values) => handleValuesChange(props, values) })(ParamsMapper)
