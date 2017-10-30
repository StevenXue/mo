import React from 'react'
import { Form, Card, Select, Button } from 'antd'
import { get } from 'lodash'

import ArgsMapper from '../../../../components/ArgsMapper'
import styles from './index.less'

class LayerCard extends React.Component {
  state = {}

  handleSelect = (value) => {
    this.props.setValueOfValues()
  }

  render() {
    const {
      title, layerIndex, step, style, onClick, model, dispatch, namespace, funcs
    } = this.props
    const arg = step.args[0]

    let layerName
    if(arg.values[layerIndex]) {
      layerName = arg.values[layerIndex].name
    }
      console.log('ln', layerName)

    const layers = arg.range

    let args = []
    if (layerName) {
      args = layers.find(e => e.name === layerName).args
    }

    return (
      <Card className={`${styles.box} layer-card`} style={style} onClick={onClick}>
        <div className={styles.header}>
          {title}
        </div>
        <div className={styles.body}>
          <Select placeholder="Choose Layer" style={{ width: '60%', marginBottom: 10 }} onChange={(name)=> {
            funcs.setValueOfValues({name})
          }}
          value={layerName}>
            {
              layers.map((e) =>
                <Select.Option value={e.name} key={e.name}>{e.name}</Select.Option>,
              )
            }
          </Select>
          <ArgsMapper args={args} layerName={layerName} funcs={funcs} />
        </div>
        <div className={styles.add}>
          {
            layerIndex > -1 &&
            <Button shape="circle" icon="plus" size='small' style={{ zIndex: 9 }} onClick={() => funcs.addValue({})}/>
          }
        </div>
      </Card>
    )
  }
}

export default LayerCard
