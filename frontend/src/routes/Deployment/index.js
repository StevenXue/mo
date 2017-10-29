import React from 'react';
import {connect} from 'dva';
import styles from './index.less';
import {Tabs, Switch, Button, Input, Icon, Spin, Modal} from 'antd';
import {arrayToJson, JsonToArray} from '../../utils/JsonUtils';
import LearningCurve from '../../components/Charts/curve';
import HeatmapOnCartesianChart from '../../components/Charts/heatmapOnCartesianChart';
import DeployModal from '../../components/deployModal/deployModal';
import {get} from 'lodash';

const {TextArea} = Input;
const TabPane = Tabs.TabPane;
const confirm = Modal.confirm;
const fakeField = ['A', 'B', 'AC', 'ABBB', 'ACCCCC']

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
    if (mode === 'undeploy') {
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
    return (<div><h1>What is Deployment</h1>
      <p>Deployment module will host the model you trained and provide
        remote access to it. After deployment, you can make predictions
        for new data samples through provided gRPC/HTTP service.</p>
      <Button type="primary"
              onClick={() => onClickModifyModal(true)}>Deploy</Button>
      <DeployModal dispatch={dispatch} deployment={deployment}
                   visible={deployment.modalState} firstDeploy={true}/></div>)
  }
  else if (modelsJson[focusModelId]['served_model']['status'] === 'serving') {
    return (<div><Spin spinning={loadingState}>
      <DeployModal dispatch={dispatch} deployment={deployment}
                   visible={deployment.modalState} firstDeploy={false}/>
      <h1>Overview</h1><Icon type="edit"
                             onClick={() => onClickModifyModal(true)}/>
      <h2>Name</h2>
      <pre>{modelsJson[focusModelId]['served_model']['name']}</pre>
      <h2>Description</h2>
      <pre>{modelsJson[focusModelId]['served_model']['description']}</pre>
      <h1>Usage</h1>
      <h2>Input</h2>
      <pre>{modelsJson[focusModelId]['served_model']['input_info']}</pre>
      <h2>Output</h2>
      <pre>{modelsJson[focusModelId]['served_model']['output_info']}</pre>
      <h2>Examples</h2>
      <pre>{modelsJson[focusModelId]['served_model']['examples']}</pre>
      <Button type="primary" onClick={() => onClickModel('undeploy')}>
        Stop Service</Button> {/*<LineChart/>*/}
      <h1>1.TYPE YOUR INPUT</h1>
      <TextArea className={styles.inputtext} rows={4}
                placeholder="TYPE YOUR INPUT"/>
      <Button type="primary">Run</Button>
      <h1>2.SEE THE RESULT</h1>
      <TextArea rows={4} placeholder="SEE THE RESULT"/>
      <h1>3.USE THIS ALGORITHM</h1>
      <TextArea rows={4} placeholder="USE THIS ALGORITHM"/>
    </Spin>
    </div> )
  }
  else {
    return (<div>
      <Spin spinning={loadingState}>
      <DeployModal dispatch={dispatch} deployment={deployment}
                   visible={deployment.modalState} firstDeploy={false}/>
      <h1>Overview</h1><Icon type="edit"
                             onClick={() => onClickModifyModal(true)}/>
      <h2>Name</h2>
      <pre>{modelsJson[focusModelId]['served_model']['name']}</pre>
      <h2>Description</h2>
      <pre>{modelsJson[focusModelId]['served_model']['description']}</pre>
      <h1>Usage</h1>
      <h2>Input</h2>
      <pre>{modelsJson[focusModelId]['served_model']['input_info']}</pre>
      <h2>Output</h2>
      <pre>{modelsJson[focusModelId]['served_model']['output_info']}</pre>
      <h2>Examples</h2>
      <pre>{modelsJson[focusModelId]['served_model']['examples']}</pre>
      <Button type="primary" onClick={() => onClickModel('resume')}>
        Start Service</Button>
    </Spin>
    </div> )
  }
}


function Deployment({deployment, dispatch}) {
  const {
    modelsJson,
    focusModelId,
  } = deployment;
  const models = JsonToArray(modelsJson);

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
            <div>Models</div>
            <div>State</div>
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
              return (
                <div key={model._id + model.model.name}
                     onClick={() => onClickModel(model._id)}
                     className={styles.row}
                     style={{
                       opacity: opacity,
                       backgroundColor: backgroundColor,
                       fontColor: color
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
              <h1>Dataset</h1>
              <div className={styles.fields}>
                {fakeField.map(field =>
                  <div
                    key={field}
                    className={styles.field}
                    style={{backgroundColor: '#F3F3F3'}}
                  >
                    <p className={styles.text}>{field}</p>
                  </div>
                )}
              </div>

              <h1>Performance</h1>
              <div>
                {get(modelsJson, `[${focusModelId}].metrics_status`) ?
                  <LearningCurve
                    data={get(modelsJson, `[${focusModelId}].metrics_status`)}/> : null}
              </div>
              <HeatmapOnCartesianChart/>
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
