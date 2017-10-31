import React from 'react'
import { Form, Button, Select, Input } from 'antd'
import styles from './index.less'

const FormItem = Form.Item

function ParamsMapper({
                        args,
                        layerIndex,
                        layers,
                        value,
                        setValueDefault,
                        form: {
                          getFieldValue,
                          getFieldsValue,
                          getFieldDecorator,
                          validateFields,
                        },

                      }) {

  const valueParser = {
    int: (e) => JSON.parse(e),
    float: (e) => JSON.parse(e),
    str: (e) => (e),
  }

  const typeParser = (type, valueType) => {
    const typeDict = {
      int: 'integer',
      float: 'float',
      str: 'string',
    }

    switch (type) {
      case 'multiple_input':
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
            return e.target.value.split(',').map(e => {
              return valueParser[valueType](e)
            })
          } catch (err) {
            return e.target.value
          }
        }
      case 'input':
        try {
          return valueParser[valueType](e.target.value)
        } catch (err) {
          return e.target.value
        }
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
        args.map((arg, i) => {

          let v = arg.value || arg.values
          // console.log({ [arg.name]: arg.values }, arg.value || (arg.values && arg.values.length > 0))
          if (arg.value || (arg.values && arg.values.length > 0)) {
            setValueDefault({ [arg.name]: v })
          }
          return <FormItem
            key={i}
            label={arg.display_name}
            // className={styles.item}
          >
            {
              getFieldDecorator(arg.name, {
                initialValue: arg.default,
                getValueFromEvent: (value) => splitHandler(value, arg.type, arg.value_type),
                rules: [
                  {
                    required: arg.required, message: `need ${arg.value_type}`,
                    type: typeParser(arg.type, arg.value_type),
                  },
                ],
              })(switchComponent(arg))
            }
          </FormItem>
        })
      }
    </Form>
  )
}

const handleValuesChange = ({ setValue }, values) => {
  setValue(values)
}

export default Form.create({ onValuesChange: (props, values) => handleValuesChange(props, values) })(ParamsMapper)
