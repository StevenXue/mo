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
    //deploying中的 model
    deployingModelsId: [],
    //加载状态
    loading: false,
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
              if (eachMetricHis[metric]) {
                metrics[metric].push(getRound(eachMetricHis[metric],2))
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
        ...state.modelsJson[state.focusModelId],
        deployDescription: action.payload.deployDescription,
        deployInput: action.payload.deployInput,
        deployOutput: action.payload.deployOutput,
        deployExamples: action.payload.deployExamples,
      };

      return {
        ...state,
        modelsJson: {
          ...state.modelsJson,
          [state.focusModelId]: newInfo
        }
      }
    },

    showModal(state, action) {
      return {
        ...state,
        modalState: action.payload.modalState,
      }
    },


    // deploy  model
    deployModel(state, action) {
      let newInfo = {
        ...state.modelsJson[state.focusModelId],
        deployState: 1,
      };
      return {
        ...state,
        modelsJson: {
          ...state.modelsJson,
          [state.focusModelId]: newInfo
        }
      }
    },
    // undeploy  model

    undeployModel(state, action) {
      let newInfo = {
        ...state.modelsJson[state.focusModelId],
        deployState: 1,
      };
      return {
        ...state,
        modelsJson: {
          ...state.modelsJson,
          [state.focusModelId]: newInfo
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
      yield put({type: 'setModels', payload: {modelsJson: modelsJson}})
    },


    // 部署Model
    * deployModels(action, {call, put, select}) {
      const modelId = action.modelId;
      const modelsJson = yield select(state => state.deployment.modelsJson);
      const model = modelsJson[modelId];
      const models = yield call(deploymentService.deployModel, modelId, model);
    },


  },
  subscriptions: {
    // 当进入该页面是 获取用户所有 Models
    setup({dispatch, history}) {
      return history.listen(({pathname}) => {
        const match = pathToRegexp('/projects/:projectId/deploy').exec(pathname);
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
