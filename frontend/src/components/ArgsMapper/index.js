import React from 'react'
import { Form, Button, Select, Input } from 'antd'
import styles from './index.less'

const FormItem = Form.Item

function ArgsMapper({
                      layerIndex,
                      layers,
                      value,
                      form: {
                        getFieldValue,
                        getFieldsValue,
                        getFieldDecorator,
                        validateFields,
                      },
                      funcs: {
                        addValue,
                        setValueOfValues,
                        updateLayerArgs,
                        updateValueOfValues,
                      },
                    }) {

  const formItemLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 14 },
  }

  let args = []
  if (value.args) {
    args = value.args
  } else {
    let layerName = getFieldValue('name')
    if (layerName) {
      args = layers.find(e => e.name === layerName).args
    }
  }

  // updateValueOfValues({units: 32, activation: 'relu', input_shape: [1,1]})

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
        return <Input />
      case 'choice':
        return (
          <Select style={{ width: 142 }} >
            {
              arg.range.map((option) =>
                <Select.Option value={option} key={option}>{option}</Select.Option>,
              )
            }
          </Select>
        )
      case 'multiple_choice':
        return (
          <Select style={{ width: 142 }} mode='multiple' >
            {
              arg.range.map((option) =>
                <Select.Option value={option} key={option}>{option}</Select.Option>,
              )
            }
          </Select>
        )
      default:
        return <Input />
    }
  }

  return (
    <Form layout='inline' className={styles.form}
          key={`layer-form-${layerIndex}`}
      // onSubmit={handleSubmit}
    >
      <FormItem
        label={'Select Layer'}
        key='layer-select'
        // className={styles.item}
      >
        {
          getFieldDecorator('name', {
            // initialValue: 'Dense',
            // getValueFromEvent: value => value,
            rules: [
              { required: true },
            ],
          })(
            <Select placeholder="Choose Layer" style={{ width: 142 }}
                    onChange={(value) => {
                      args = layers.find(e => e.name === value).args
                      updateValueOfValues({name: value, args})
                    }}>
              {
                layers.map((e) =>
                  <Select.Option value={e.name} key={e.name}>{e.name}</Select.Option>,
                )
              }
            </Select>,
          )
        }
      </FormItem>
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

const handleValuesChange = ({
                              layerName,
                              funcs: {
                                addValue,
                                setValueOfValues,
                                updateValueOfValues,
                                updateLayerArgs,
                              },
                            }, layer) => {

  updateLayerArgs(layer)
}

export default Form.create({ onValuesChange: (props, layer) => handleValuesChange(props, layer) })(ArgsMapper)
