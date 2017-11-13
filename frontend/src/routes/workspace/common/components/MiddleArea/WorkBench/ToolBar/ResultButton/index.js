import React, { Component } from 'react'
import styles from '../ToolBar.less'
import { connect } from 'dva'
import { Icon, Button, Modal } from 'antd'
import VisualizationPanel from './visualizationPanel.js'
import LearningCurve from '../../../../../../../../components/Charts/curve'
import { isEmpty, get } from 'lodash'
import JSONTree from 'react-json-tree'

class ResultButton extends Component {
  state = {
    visible: false,
  }

  render() {
    const {
      sectionsJson,
      focusSectionsId,
    } = this.props.model

    const { model, dispatch, namespace, sectionId } = this.props

    // const resultJson = {
    //   "history": get(sectionsJson[focusSectionId], 'results')
    // }
    console.log("this.props.model", this.props.model)


    const history = get(sectionsJson[sectionId].results, 'history', null)
    const result = get(sectionsJson[sectionId].results, 'result', null)

    const visible = sectionId === model.focusSectionsId ? model.resultVisible : false

    return (
      <div onClick={() => dispatch({ type: namespace + '/showResult' })}
           className={styles.result}
      >
        <Icon type="bar-chart" style={{ fontSize: 20, margin: 10, color: 'white' }}/>
        <span className={styles.text}>
          Result
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
          <div>
            {( (history&&history.length!==0) || (result&&!isEmpty(result))) ? <div style={{height: 200, overflowY: 'auto'}} >
              <JSONTree data={{
                'history': history,
                'result': result
              }}
                        style={{width: '100%', height: 400}}
                        theme={{
                          scheme: 'google',
                          author: 'seth wright (http://sethawright.com)',
                          base00: '#1d1f21',
                          base01: '#282a2e',
                          base02: '#373b41',
                          base03: '#969896',
                          base04: '#b4b7b4',
                          base05: '#c5c8c6',
                          base06: '#e0e0e0',
                          base07: '#ffffff',
                          base08: '#CC342B',
                          base09: '#F96A38',
                          base0A: '#FBA922',
                          base0B: '#198844',
                          base0C: '#3971ED',
                          base0D: '#3971ED',
                          base0E: '#A36AC7',
                          base0F: '#3971ED'
                        }}
                        invertTheme={true}/>
            </div>: null
            }
            <LearningCurve {...this.props} />
          </div>
        }

        </Modal>

      </div>
    )
  }

}

export default ResultButton
