import React, {Component} from 'react';
import styles from '../ToolBar.less';
import {connect} from 'dva';
import {Icon, Button, Modal} from 'antd';
import VisualizationPanel from './visualizationPanel.js';
import LearningCurve from '../../../../../../../../components/Charts/curve';


class ResultButton extends Component {
  state = {
    onFocus: false,

    visible: false,
  };


  render() {
    return (
      <div onFocus={() => {
        this.setState({
          onFocus: true
        }, console.log("this.state.onFocus", this.state.onFocus));
      }}
           onClick={() => this.setState({visible: true})}

           className={styles.result}
      >
        <Icon type="bar-chart" style={{fontSize: 20, margin: 10, color: 'white'}}/>
        <span className={styles.text}>
          Result {this.state.onFocus}
        </span>

        <Modal title="Result Visualizations"
               width={1200}
               visible={this.state.visible}
               onOk={() => this.setState({visible: false})}
               onCancel={() => this.setState({visible: false})}
               footer={[
                 <Button key="submit" type="primary" size="large" onClick={() => this.setState({visible: false})}>
                   OK
                 </Button>
               ]}
        >{this.props.namespace === 'dataAnalysis'?
          <VisualizationPanel {...this.props}/>:
          <LearningCurve {...this.props} />
        }

        </Modal>

      </div>
    );
  }

}

export default ResultButton;
