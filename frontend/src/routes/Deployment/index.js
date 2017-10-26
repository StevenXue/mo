import React from 'react';
import {connect} from 'dva';
import styles from './index.less';
import {Tabs, Switch, Button, Input, Icon,notification,Modal} from 'antd';
import {arrayToJson, JsonToArray} from '../../utils/JsonUtils';
import LearningCurve from '../../components/Charts/curve';
import HeatmapOnCartesianChart from '../../components/Charts/heatmapOnCartesianChart';
import DeployModal from '../../components/deployModal/deployModal';
import { get } from 'lodash';

const {TextArea} = Input;
const TabPane = Tabs.TabPane;
const confirm = Modal.confirm;
const fakeField = ['A','B','AC','A','A']

const openNotificationWithIcon = (type) => {
  if (type ==='edit'){
    notification['success']({
      message: 'Model Info successfully edited',
      // description: 'This is the content of the notification. This is the content of the notification. This is the content of the notification.',
    });
  }
  else if (type ==='deploy'){
    notification['success']({
      message: 'Model successfully deployed',
      // description: 'This is the content of the notification. This is the content of the notification. This is the content of the notification.',
    });
  }
  else {
    notification['success']({
      message: 'Model successfully undeployed',
      // description: 'This is the content of the notification. This is the content of the notification. This is the content of the notification.',
    });
  }
};



function UseThisAPIPage({deployment, dispatch}){
  const {
    modelsJson,
    focusModelId,
  } = deployment;

  const deployModel = () => {
    dispatch({
      type: 'deployment/deployModel',
    });
  };
  const undeployModel = () => {
    dispatch({
      type: 'deployment/undeployModel',
    });
  };
  const onClickModel = () => {
    //  跳转到该model详细页面
    if (modelsJson[focusModelId]['deployState']===0){
      deployModel();
      openNotificationWithIcon('deploy');
      }
    else{
      showUndeployConfirm();
      }
  };

  const onClickModifyModal = (modalState) => {
    dispatch({
      type: 'deployment/showModal',
      payload:{modalState:modalState},
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
        openNotificationWithIcon('undeploy')
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };

  if (focusModelId === null){
    return (<div />)
  }
  else if(modelsJson[focusModelId]['deployState'] === 1){
    return (<div>
      <DeployModal dispatch={dispatch} deployment={deployment} visible={deployment.modalState} firstDeploy={false}/>
      <h1>Overview</h1><Icon type="edit" onClick={()=>onClickModifyModal(true)}/>
      <pre>{modelsJson[focusModelId]['deployDescription']}</pre>
      <h1>Usage</h1>
      <h2>Input</h2>
      <pre>{modelsJson[focusModelId]['deployInput']}</pre>
      <h2>Output</h2>
      <pre>{modelsJson[focusModelId]['deployOutput']}</pre>
      <h2>Examples</h2>
      <pre>{modelsJson[focusModelId]['deployExamples']}</pre>
      <Button type="primary" onClick={()=>onClickModel()}>
        Stop Service</Button>      {/*<LineChart/>*/}
      <h1>1.TYPE YOUR INPUT</h1>
      <TextArea className={styles.inputtext} rows={4}
                placeholder="TYPE YOUR INPUT"/>
      <Button type="primary">Run</Button>
      <h1>2.SEE THE RESULT</h1>
      <TextArea rows={4} placeholder="SEE THE RESULT"/>
      <h1>3.USE THIS ALGORITHM</h1>
      <TextArea rows={4} placeholder="USE THIS ALGORITHM"/>
    </div> )
  }
  else if(modelsJson[focusModelId]['deployState'] === 0 && modelsJson[focusModelId]['deployDescription']){
    return (<div>
      <DeployModal dispatch={dispatch} deployment={deployment} visible={deployment.modalState} firstDeploy={false}/>
      <h1>Overview</h1><Icon type="edit" onClick={()=>onClickModifyModal(true)}/>
      <h2>Name</h2>
      {/*<pre>{modelsJson[focusModelId]['deployName']}</pre>*/}
      <h2>Description</h2>
      <pre>{modelsJson[focusModelId]['deployDescription']}</pre>
      <h1>Usage</h1>
      <h2>Input</h2>
      <pre>{modelsJson[focusModelId]['deployInput']}</pre>
      <h2>Output</h2>
      <pre>{modelsJson[focusModelId]['deployOutput']}</pre>
      <h2>Examples</h2>
      <pre>{modelsJson[focusModelId]['deployExamples']}</pre>
      <Button type="primary" onClick={()=>onClickModel()}>
        Start Service</Button>
    </div> )
  }
  else{
    return(<div><h1>What is Deployment</h1>
      <p>Deployment module will host the model you trained and provide
        remote access to it. After deployment, you can make predictions
        for new data samples through provided gRPC/HTTP service.</p>
      <Button type="primary" onClick={()=>onClickModifyModal(true)}>Deploy</Button>
      <DeployModal dispatch={dispatch} deployment={deployment} visible={deployment.modalState} firstDeploy={true}/></div>)
  }
}


function Deployment({deployment, dispatch}) {
  const {
    modelsJson,
    focusModelId,
  } = deployment;
  const models = JsonToArray(modelsJson);
  const stateList = ['', 'serving'];

  const setFocusModel = (modelId) => {
    dispatch({
      type: 'deployment/setFocusModel',
      payload:{focusModelId: modelId},
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
              let state = stateList[model.deployState];
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
                {get(modelsJson,`[${focusModelId}].metrics_status`)?
                  <LearningCurve data={get(modelsJson,`[${focusModelId}].metrics_status`)}/>:null}
              </div>
              <HeatmapOnCartesianChart/>
            </TabPane>
            <TabPane tab="Use This API" key="2">
              <UseThisAPIPage deployment={deployment} dispatch={dispatch} />
            </TabPane>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
export default connect(({deployment}) => ({deployment}))(Deployment);
