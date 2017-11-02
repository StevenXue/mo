import React from 'react'
import { Form, Button, Select, Input } from 'antd'
import { cloneDeep } from 'lodash'

import { formItems } from '../../components/ParamsMapper'
import styles from './index.less'

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

  let args = value.args || []
  let layerName = value.name
  // if (value.args) {
  //    args = value.args
  // }
  // else {
  //   if (layerName) {
  //      args = layers.find(e => e.name === layerName).args
  //   }
  // }
  //
  // console.log(layerIndex, value.name)
  // updateValueOfValues({units: 32, activation: 'relu', input_shape: [1,1]})

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

          return formItems(arg, i, getFieldDecorator)
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
