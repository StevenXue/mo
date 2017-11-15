import React from 'react';
import {connect} from 'dva';
import {routerRedux} from 'dva/router'
import styles from './index.less';
import {Tabs, Switch, Button, Input, Icon, Spin, Modal} from 'antd';
import GetPredictionForm from '../../../components/PredictForm/predictForm';
import Highlight from 'react-highlight'

const {TextArea} = Input;
const TabPane = Tabs.TabPane;


function GetPredictionPage({publicServedModels, dispatch}) {
  const {
    focusModel,
  } = publicServedModels;
  if (focusModel !== null){
    return (
      <div>
        <h1>1.TYPE YOUR INPUT</h1>
        <GetPredictionForm  dispatch={dispatch}/>
        <h1>2.SEE THE RESULT</h1>
        <pre className={styles.outputpre}>
        {focusModel['0']['predict_result'] ? focusModel['0']['predict_result'] : null}
        </pre>
        <h1>3.USE THIS ALGORITHM</h1>

        <Tabs defaultActiveKey="1">
          <TabPane tab={<span>JS</span>} key="1">
            <pre className={styles.usealgorithm}>
            <Highlight
              className='JavaScript hljs code-container inline-code-container'>
              {focusModel['0']['how_to_use_code']['js']}
            </Highlight>
            </pre>
          </TabPane>
          <TabPane tab={<span>Python</span>} key="2">
            <pre className={styles.usealgorithm} >
            <Highlight
              className='python hljs code-container inline-code-container'>
              {focusModel['0']['how_to_use_code']['py']}
            </Highlight>
            </pre>
          </TabPane>
        </Tabs>
      </div>
    )
  }
  else{
    return (<div />)
  }
}

function PublicServedModelsDetail({publicServedModels, dispatch}) {
  const {
    focusModel,
  } = publicServedModels;
  if (focusModel !== null){
  return (
    <div style={{padding: 40}}>

        <h2
          style={{paddingBottom: 10}}>{focusModel['0']['name']}
        </h2>

        <p>{focusModel['0']['description']}</p>
        <h2 style={{padding: '20px 0 0 0'}}>Usage</h2>
        <h3 style={{padding: '10px 0 10px 0'}}>Input</h3>
        <pre>{focusModel['0']['input_info']}</pre>
        <h3 style={{padding: '10px 0 10px 0'}}>Output</h3>
        <pre>{focusModel['0']['output_info']}</pre>
        <h3 style={{padding: '10px 0 10px 0'}}>Examples</h3>
        <pre>{focusModel['0']['examples']}</pre>
      <div><GetPredictionPage publicServedModels={publicServedModels} dispatch={dispatch}/>
      </div>
    </div>
  )
  }
  else{
    return (<div />)
  }
}

export default connect(({publicServedModels}) => ({publicServedModels}))(PublicServedModelsDetail);
