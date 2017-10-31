import React from 'react'
import { Form, Button, Select, Input } from 'antd'
import styles from './index.less'
import { cloneDeep } from 'lodash'

const FormItem = Form.Item

function ArgsMapper({
                      layerIndex,
                      layers,
                      value,
                      last,
                      featureFields,
                      labelFields,
                      form: {
                        getFieldValue,
                        getFieldsValue,
                        getFieldDecorator,
                        validateFields,
                      },
                      funcs: {
                        updateValueOfValues,
                        setLayerDefault,
                      },
                    }) {

  let args = []
  let layerName = getFieldValue('name') || value.name
  if (value.args) {
     args = value.args
  } else {
    if (layerName) {
       args = layers.find(e => e.name === layerName).args
    }
  }

  // updateValueOfValues({units: 32, activation: 'relu', input_shape: [1,1]})

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
            initialValue: layerName,
            // getValueFromEvent: value => value,
            rules: [
              { required: true },
            ],
          })(
            <Select placeholder="Choose Layer" style={{ width: 142 }}
                    onChange={(value) => {
                      const args = cloneDeep(layers.find(e => e.name === value).args)
                      updateValueOfValues({ name: value, args })
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
        args.map((arg, i) => {
          // no need to fill input shape except first layer
          if (layerIndex > 0 && arg.name === 'input_shape') {
            return
          }

          if (layerIndex === 0 && arg.name === 'input_shape' && featureFields.length > 0) {
            setLayerDefault({ [arg.name]: [featureFields.length] })
          } else if (last && arg.name === 'units' && labelFields.length > 0) {
            setLayerDefault({ [arg.name]: labelFields.length })
          }
          // else
          let v
          if (arg.value || (arg.values && arg.values.length > 0)) {
            v = arg.value || arg.values
          }

          return <FormItem
            key={`${layerIndex}${i}`}
            label={arg.display_name}
            // className={styles.item}
          >
            {
              getFieldDecorator(arg.name, {
                initialValue: v || arg.default,
                getValueFromEvent: (value) => splitHandler(value, arg.type, arg.value_type),
                rules: [
                  {
                    required: arg.required, message: `need ${arg.value_type} ${arg.type}`,
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

const handleValuesChange = ({
                              funcs: {
                                updateLayerArgs,
                              },
                            }, layer) => {
  console.log('111', layer)
  updateLayerArgs(layer)
}

export default Form.create({ onValuesChange: (props, layer) => handleValuesChange(props, layer) })(ArgsMapper)
