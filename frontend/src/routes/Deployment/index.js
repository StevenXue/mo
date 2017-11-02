import React from 'react';
import {connect} from 'dva';
import styles from './index.less';
import {Tabs, Switch, Button, Input, Icon, Spin, Modal} from 'antd';
import {arrayToJson, JsonToArray} from '../../utils/JsonUtils';
import LearningCurve from '../../components/Charts/curve';
import HeatmapOnCartesianChart from '../../components/Charts/heatmapOnCartesianChart';
import DeployModal from '../../components/deployModal/deployModal';
import GetPredictionForm from '../../components/PredictForm/predictForm';
import {get} from 'lodash';
import Highlight from 'react-highlight'

const {TextArea} = Input;
const TabPane = Tabs.TabPane;
const confirm = Modal.confirm;


function GetPredictionPage({deployment, dispatch}) {
  const {
    modelsJson,
    focusModelId,
    loadingState,
  } = deployment;
  if (modelsJson[focusModelId]['served_model']['status'] === 'serving') {
    return (
      <div>
        <h1>1.TYPE YOUR INPUT</h1>
        <GetPredictionForm deployment={deployment} dispatch={dispatch}/>
        <h1>2.SEE THE RESULT</h1>
        <pre className={styles.outputpre}>
        {modelsJson[focusModelId]['served_model']['predict_result'] ? modelsJson[focusModelId]['served_model']['predict_result'] : null}
        </pre>
        <h1>3.USE THIS ALGORITHM</h1>

        <Tabs defaultActiveKey="1">
          <TabPane tab={<span>JS</span>} key="1">
            <pre className={styles.usealgorithm}>
            <Highlight
              className='JavaScript hljs code-container inline-code-container'>
              {modelsJson[focusModelId]['how_to_use_code']['js']}
            </Highlight>
            </pre>
          </TabPane>
          <TabPane tab={<span>Python</span>} key="2">
            <pre className={styles.usealgorithm} >
            <Highlight
              className='python hljs code-container inline-code-container'>
              {modelsJson[focusModelId]['how_to_use_code']['py']}
            </Highlight>
            </pre>
          </TabPane>
        </Tabs>
      </div>
    )
  }
  else {
    return (<div/>)
  }
}

function UseThisAPIPage({deployment, dispatch}) {
  const {
    modelsJson,
    focusModelId,
    loadingState,
  } = deployment;

  const deployModel = () => {
    dispatch({
      type: 'deployment/resumeModel',
      payload: {served_model_id: get(modelsJson, `[${focusModelId}].served_model._id`)},
    });
  };
  const undeployModel = () => {
    dispatch({
      type: 'deployment/undeployModel',
      payload: {served_model_id: get(modelsJson, `[${focusModelId}].served_model._id`)},
    });
  };
  const onClickModel = (mode) => {
    //  跳转到该model详细页面
    if (mode === 'serving') {
      showUndeployConfirm();
    }
    else {
      deployModel();
    }
  };

  const onClickModifyModal = (modalState) => {
    dispatch({
      type: 'deployment/showModal',
      payload: {modalState: modalState},
    });
  };

  const showUndeployConfirm = () => {
    confirm({
      title: 'Are you sure undeploy this model?',
      content: 'Some descriptions',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        undeployModel();
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };


  if (focusModelId === null) {
    return (<div/>)
  }
  else if (modelsJson[focusModelId]['served_model'] === null) {
    return (
      <div className={styles.whatisdeploydiv}><Spin spinning={loadingState}>
        <h1 className={styles.whatisdeployh1}>What is Deployment</h1>
        <p className={styles.whatisdeployp}>Deployment module will host the
          model you trained and provide
          remote access to it. After deployment, you can make predictions
          for new data samples through provided gRPC/HTTP service.</p>
        <div className={styles.whatisdeploybuttondiv}>
          <Button type="primary"
                  onClick={() => onClickModifyModal(true)}>Deploy</Button></div>
        <DeployModal dispatch={dispatch} deployment={deployment}
                     visible={deployment.modalState} firstDeploy={true}/>
      </Spin></div>)
  }
  else {
    return (
      <div style={{padding: 40}}>
        <div><Spin spinning={loadingState}>
          <DeployModal dispatch={dispatch} deployment={deployment}
                       visible={deployment.modalState} firstDeploy={false}/>

          <h2
            style={{paddingBottom: 10}}>{modelsJson[focusModelId]['served_model']['name']}
            <Icon style={{fontSize: 24, paddingLeft: 20}} type="edit"
                  onClick={() => onClickModifyModal(true)}/>
          </h2>

          <p>{modelsJson[focusModelId]['served_model']['description']}</p>
          <h2 style={{padding: '20px 0 0 0'}}>Usage</h2>
          <h3 style={{padding: '10px 0 10px 0'}}>Input</h3>
          <pre>{modelsJson[focusModelId]['served_model']['input_info']}</pre>
          <h3 style={{padding: '10px 0 10px 0'}}>Output</h3>
          <pre>{modelsJson[focusModelId]['served_model']['output_info']}</pre>
          <h3 style={{padding: '10px 0 10px 0'}}>Examples</h3>
          <pre>{modelsJson[focusModelId]['served_model']['examples']}</pre>

          <div style={{textAlign: 'center'}}><Button style={{
            backgroundColor: modelsJson[focusModelId]['served_model']['status'] === 'serving' ? 'red' : '',
            borderColor: modelsJson[focusModelId]['served_model']['status'] === 'serving' ? 'red' : '',
            margin: 10
          }} type="primary"
                                                     onClick={() => onClickModel(modelsJson[focusModelId]['served_model']['status'])}>
            {modelsJson[focusModelId]['served_model']['status'] === 'serving' ? 'Stop Service' : 'Resume Service'}
          </Button></div>
        </Spin></div>
        <div><GetPredictionPage deployment={deployment} dispatch={dispatch}/>
        </div>
      </div>
    )
  }
}


function Deployment({deployment, dispatch}) {
  const {
    modelsJson,
    focusModelId,
  } = deployment;
  const models = JsonToArray(modelsJson);
  const featuresTargetsCards = get(modelsJson, `[${focusModelId}].params.fit.data_fields`, [[], []]);
  const setFocusModel = (modelId) => {
    dispatch({
      type: 'deployment/setFocusModel',
      payload: {focusModelId: modelId},
    });
  };
  const onClickModel = (modelId) => {
    //  跳转到该model详细页面
    setFocusModel(modelId)
  };
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.sidebar}>
          <div className={styles.titleRow}>
            <div>Model List</div>
          </div>
          <div>
          </div>
          {
            models.map((model, i) => {
              let backgroundColor;
              let opacity;
              let color = 'black';
              if (focusModelId && (model._id === focusModelId)) {
                backgroundColor = "#34C0E2";
                color = 'white';
              } else {
                opacity = i % 2 ? 0.7 : 1;
                color = 'black';
              }
              let state = get(model, 'served_model.status');
              if (state === 'terminated') {
                state = ''
              }
              return (
                <div key={model._id + model.model.name}
                     onClick={() => onClickModel(model._id)}
                     className={styles.row}
                     style={{
                       opacity: opacity,
                       backgroundColor: backgroundColor,
                       fontColor: color,
                       padding: 20,
                     }}
                >
                  <div>{model.model.name}</div>
                  <div>{state}</div>
                </div>
              )
            })
          }
        </div>
        <div className={styles.middleArea}>
          <Tabs
            defaultActiveKey="1"
            tabPosition="top"
          >
            <TabPane tab="Information" key="1">
              <div style={{padding: 40}}>
                <h1>Dataset</h1>
                <div style={{padding: 20}}>
                  <h2
                    style={{padding: '0 0 10px 0'}}>{get(modelsJson, `[${focusModelId}].datasetInfo.name`)}</h2>
                  <p>{get(modelsJson, `[${focusModelId}].datasetInfo.description`)}</p>
                  <h2 style={{padding: '20px 0 10px 0'}}>Selected Fields</h2>
                  <h3>Input</h3>
                  <div className={styles.fields}>
                    {featuresTargetsCards[0].map(field =>
                      <div
                        key={field}
                        className={styles.field}
                        style={{backgroundColor: '#F3F3F3'}}
                      >
                        <p className={styles.text}>{field}</p>
                      </div>
                    )}
                  </div>
                  <h3>Output</h3>
                  <div className={styles.fields}>
                    {featuresTargetsCards[1].map(field =>
                      <div
                        key={field}
                        className={styles.field}
                        style={{backgroundColor: '#F3F3F3'}}
                      >
                        <p className={styles.text}>{field}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h1>Performance</h1>
                  <div style={{padding: 20}}>
                    {get(modelsJson, `[${focusModelId}].metrics_status`) ?
                      <LearningCurve
                        data={get(modelsJson, `[${focusModelId}].metrics_status`)}/> : null}
                  </div>
                </div>
              </div>
              {/*<HeatmapOnCartesianChart/>*/}
            </TabPane>
            <TabPane tab="Use This API" key="2">
              <UseThisAPIPage deployment={deployment} dispatch={dispatch}/>
            </TabPane>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default connect(({deployment}) => ({deployment}))(Deployment);
