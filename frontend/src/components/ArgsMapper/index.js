import React from 'react'
import { Form, Button, Select, Input } from 'antd'
import styles from './index.less'

const FormItem = Form.Item

function ArgsMapper({
                      args,
                      layerName,
                      form: {
                        getFieldsValue,
                        getFieldDecorator,
                        validateFields,
                      },
                      funcs: {
                        addValue,
                        setValueOfValues,
                      },
                    }) {

  const formItemLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 14 },
  }

  const valueParser = {
    int: (e) => parseInt(e),
    float: (e) => parseFloat(e),
    str: (e) => (e),
  }

  const splitHandler = (e, type, valueType) => {
    switch (type) {
      case 'multiple_input':
        return e.target.value.split(',').map(e => {
          if (e === '') {
            return ''
          }
          return valueParser[valueType](e)
        })
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
      default:
        return <Input/>
    }
  }
  return (
    <Form layout='inline' className={styles.form}
      // onSubmit={handleSubmit}
          >
      {
        args.map((arg, i) => <FormItem
          key={arg.name}
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
      {/*{args.length > 0 &&*/}
      {/*<FormItem*/}
        {/*wrapperCol={{ span: 12, offset: 2 }}*/}
      {/*>*/}
        {/*<Button type="primary" size='small' htmlType="submit">Generate Layer</Button>*/}
      {/*</FormItem>*/}
      {/*}*/}
    </Form>
  )
}

const handleSubmit = ({
                        layerName,
                        funcs: {
                          addValue,
                          setValueOfValues,
                        },
                      }, layer) => {
  layer.name = layerName
  setValueOfValues(layer)
}

export default Form.create({ onValuesChange: (props, layer) => handleSubmit(props, layer) })(ArgsMapper)
