import * as deploymentService from '../services/deployment';
import * as stagingDataService from '../services/stagingData';
import {arrayToJson} from '../utils/JsonUtils';
import {getRound} from '../utils/number';
import pathToRegexp from 'path-to-regexp';

export default {
  namespace: 'deployment',
  state: {
    //用户拥有的 models
    modelsJson: [],
    loadingState:false,
  },
  reducers: {
    // 获取所有的models

    setModels(state, action) {
      let lengthModelsJson = Object.keys(action.payload.modelsJson).length;

      if (lengthModelsJson !== 0) {
        for (let eachModel in action.payload.modelsJson) {
          let metrics = {
            'acc': [],
            'precision': [],
            'recall': [],
            'loss': [],
            'val_acc': [],
            'val_precision': [],
            'val_recall': [],
            'val_loss': [],
          };
          for (let eachMetricHis of action.payload.modelsJson[eachModel].metrics_status) {
            for (let metric of Object.keys(metrics)) {
              if (eachMetricHis[metric] !== undefined) {
                metrics[metric].push(getRound(eachMetricHis[metric], 2))
              }
            }
          }
          // 剔除空的metrics
          for (let metric of Object.keys(metrics)) {
            if (metrics[metric].length === 0) {
              delete metrics[metric];
            }
          }

          action.payload.modelsJson[eachModel]['metrics_status'] = metrics;
        }

        return {
          ...state,
          modelsJson: action.payload.modelsJson,
          focusModelId: Object.keys(action.payload.modelsJson)[0]
        }
      }
      else {
        return {
          ...state,
          modelsJson: action.payload.modelsJson,
          focusModelId: null
        }
      }
    },

    // 切换 focus model
    setFocusModel(state, action) {
      return {
        ...state,
        focusModelId: action.payload.focusModelId,
      }
    },

    // 存储 deploy 时 model的 信息
    setModelHowToUse(state, action) {
      let newInfo = {
        ...state.modelsJson[state.focusModelId]['served_model'],
        name: action.payload.deployName,
        description: action.payload.deployDescription,
        input_info: action.payload.deployInput,
        output_info: action.payload.deployOutput,
        examples: action.payload.deployExamples,
      };

      return {
        ...state,
        modelsJson: {
          ...state.modelsJson,
          [state.focusModelId]: {
            ...state.modelsJson[state.focusModelId],
            ['served_model']: newInfo
          }
        }
      }
    },

    showModal(state, action) {
      return {
        ...state,
        modalState: action.payload.modalState,
      }
    },

    showLoading(state, action) {
      return {
        ...state,
        loadingState: action.payload.loadingState,
      }
    },
    // changeModelStatus
    changeModelStatus(state, action) {
      let newInfo = {
        ...state.modelsJson[state.focusModelId]['served_model'],
        status: action.payload.status,
      };
      return {
        ...state,
        modelsJson: {
          ...state.modelsJson,
          [state.focusModelId]: {
            ...state.modelsJson[state.focusModelId],
            ['served_model']: newInfo
          }
        }
      }
    },
  },
  effects: {
    // 获取用户所有Models
    * fetchModels(action, {call, put}) {
      const {data: {[action.payload.categories]: models}} = yield call(deploymentService.fetchModels, {
        projectId: action.payload.projectId,
        categories: action.payload.categories,
      });
      // array to json
      const modelsJson = arrayToJson(models, '_id');
      // 查询 部署的状态
      yield put({type: 'setModels', payload: {modelsJson: modelsJson}})
    },

    // 首次部署模型
    * firstDeployModel(action, {call, put, select}) {
      yield put({type: 'showLoading', payload: {loadingState:true}});
      const focusModelId = yield select(state => state.deployment.focusModelId);
      const user_ID = yield select(state => state.login.user.user_ID);
      let payload = action.payload;
      payload.jobID = focusModelId;
      payload.user_ID = user_ID;
      yield call(deploymentService.firstDeployModel, payload);
      yield put({type: 'showLoading', payload: {loadingState:false}});
    },

    // 更新部署模型的信息
    * undateDeployModelInfo(action, {call, put, select}) {
      yield put({type: 'showLoading', payload: {loadingState:true}});
      let payload = action.payload;
      const {data: result} = yield call(deploymentService.updateDeployModelInfo, payload);
      if (result === 'updated') {
        yield put({type: 'setModelHowToUse', payload: payload});
      }
      yield put({type: 'showLoading', payload: {loadingState:false}});
    },

    // 部署Model
    * resumeModel(action, {call, put, select}) {
      yield put({type: 'showLoading', payload: {loadingState:true}});
      const user_ID = yield select(state => state.login.user.user_ID);
      let payload = action.payload;
      payload.user_ID = user_ID;
      const {data: result} = yield call(deploymentService.resumeModel, payload)
      if (result === 'resumed') {
        yield put({type: 'changeModelStatus', payload: {status:'serving'}});
      }
      yield put({type: 'showLoading', payload: {loadingState:false}});
    },

    // 取消部署Model
    * undeployModel(action, {call, put, select}) {
      yield put({type: 'showLoading', payload: {loadingState:true}});
      const {data: result} = yield call(deploymentService.undeployModel, action.payload);
      if (result === 'terminated') {
        yield put({type: 'changeModelStatus', payload: {status:'terminated'}});
      }
      yield put({type: 'showLoading', payload: {loadingState:false}});
    },
  },
  subscriptions: {
    // 当进入该页面是 获取用户所有 Models
    setup({dispatch, history}) {
      return history.listen(({pathname}) => {
        const match = pathToRegexp('/workspace/:projectId/deploy').exec(pathname);
        if (match) {
          const projectId = match[1];
          dispatch({
            type: 'fetchModels',
            payload: {projectId: projectId, categories: 'model'},
          });
        }
      });
    },
  },
};
