import React, { Component } from 'react'
import styles from '../ToolBar.less'
import { connect } from 'dva'
import { Icon, Button, Modal } from 'antd'
import VisualizationPanel from './visualizationPanel.js'
import LearningCurve from '../../../../../../../../components/Charts/curve'

class ResultButton extends Component {
  state = {
    onFocus: false,
    visible: false,
  }

  render() {
    const { model, dispatch, namespace, sectionId } = this.props
    const visible = sectionId === model.focusSectionsId ? model.resultVisible : false
    return (
      <div onFocus={() => {
        this.setState({
          onFocus: true,
        }, console.log('this.state.onFocus', this.state.onFocus))
      }}
           onClick={() => dispatch({ type: namespace + '/showResult' })}

           className={styles.result}
      >
        <Icon type="bar-chart" style={{ fontSize: 20, margin: 10, color: 'white' }}/>
        <span className={styles.text}>
          Result {this.state.onFocus}
        </span>

        <Modal title="Result Visualizations"
               width={1200}
               visible={visible}
               onOk={() => dispatch({ type: namespace + '/hideResult' })}
               onCancel={() => dispatch({ type: namespace + '/hideResult' })}
               footer={[
                 <Button key="submit" type="primary" size="large"
                         onClick={() => dispatch({ type: namespace + '/hideResult' })}>
                   OK
                 </Button>,
               ]}
        >{this.props.namespace === 'dataAnalysis' ? <VisualizationPanel {...this.props}/> :
          <LearningCurve {...this.props} />
        }

        </Modal>

      </div>
    )
  }

}

export default ResultButton
