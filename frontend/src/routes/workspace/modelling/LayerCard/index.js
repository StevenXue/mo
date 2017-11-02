import React from 'react'
import { Form, Card, Select, Button } from 'antd'
import { get } from 'lodash'

import ArgsMapper from '../../../../components/ArgsMapper'
import styles from './index.less'

class LayerCard extends React.Component {
  state = {}

  render() {
    const {
      title, layerIndex, argIndex, arg, baseStep, style, onClick, model, dispatch, namespace, funcs,
      featureFields, labelFields
    } = this.props

    const baseArg = baseStep.args[0]
    // const arg = step.args[0]

    // console.log('ln', layerName)

    const layers = arg.range
    const value = arg.values[layerIndex]
    // console.log('values', arg.values)

    return (
      <Card className={`${styles.box} layer-card`} style={style} onClick={onClick} key={`${argIndex}${layerIndex}`}>
        <div className={styles.header}>
          {title}
          {
            layerIndex > 0 && layerIndex < arg.values.length - 1 &&
            <Button shape="circle" icon="close" size='small' style={{ zIndex: 9, float: 'right' }}
                    onClick={() => funcs.deleteValue()}/>
          }
        </div>
        <div className={styles.body}>
          <ArgsMapper layerIndex={layerIndex} funcs={funcs} value={value}
                      featureFields={featureFields}
                      labelFields={labelFields}
                      layers={layers} last={layerIndex === arg.values.length - 1}/>
        </div>
        <div className={styles.add}>
          {
            layerIndex < arg.values.length - 1 &&
            <Button shape="circle" icon="plus" size='small' style={{ zIndex: 9 }} onClick={() => funcs.addValue({})}/>
          }
        </div>
      </Card>
    )
  }
}

export default LayerCard
