import { routerRedux } from 'dva/router'
import pathToRegexp from 'path-to-regexp'
import { tokenLogin } from '../services/login'
import { fetchProjects, createProject, deleteProject, updateProject } from '../services/project'
import { fetchAllPublicServedModels, fetchOnePublicServedModels } from '../services/deployedmodels'
import { privacyChoices } from '../constants'
import {arrayToJson} from '../utils/JsonUtils';
import * as deploymentService from '../services/deployment';

export default {
  namespace: 'publicServedModels',
  state: {
    modelsJson: [],
    focusModel: null,
  },
  reducers: {
    setPublicServedModels(state, { payload: modelsJson }) {
      return {
        ...state,
        modelsJson,
      }
    },
    setFocusModels(state, { payload: modelJson }) {
      return {
        ...state,
        focusModel: modelJson,
      }
    },
    getPredictionR(state, action) {
      let newInfo = {
        ...state.focusModel[0],
        predict_result: action.payload.result,
      };
      return {
        ...state,
        focusModel: {
          0:{newInfo}
        }
      }
    },
  },
  effects: {

    *fetch(action, { call, put, select, take }) {

      const { data: models } = yield call(fetchAllPublicServedModels, {
        privacy: false, category: action.payload.category})
      const modelsJson = arrayToJson(models, '_id');
      yield put({ type: 'setPublicServedModels', payload: modelsJson })
    },

    *fetchone(action, { call, put, select, take }) {
      const { data: model } = yield call(fetchOnePublicServedModels, {
          model_ID: action.payload.model_ID})
      // yield put(routerRedux.push('/modelmarkets/' + action.payload.model_ID))
      // const modelJson = arrayToJson(model, '_id');
      yield put({ type: 'setFocusModels', payload: model })
    },

    * getPrediction(action, {call, put, select}) {
      const user_ID = yield select(state => state.login.user.user_ID);
      let payload = action.payload;
      payload.served_model_id = yield select(state => state.publicServedModels.focusModel[0]['_id']);
      payload.server = yield select(state => state.publicServedModels.focusModel[0]['server']);
      // payload.name=yield select(state => state.deployment.modelsJson[focusModelId]['served_model']['name']);
      payload.model_name = yield select(state => state.publicServedModels.focusModel[0]['model_name']);
      payload.features= yield select(state => state.publicServedModels.focusModel[0]['data_fields'][0]);
      const {data: result} = yield call(deploymentService.getPrediction, payload);
      yield put({type: 'getPredictionR', payload: result});
    },
  },
  subscriptions: {
    // 当进入该页面是 获取用户所有 project
    setup({ dispatch, history }) {
      return history.listen(({ pathname }) => {
        const match = pathToRegexp('/modelmarkets/:modelsId').exec(pathname)
        if (pathname === '/modelmarkets') {
          dispatch({ type: 'fetch', payload:{privacy: 'public',category: 'All' }})
        } else if (match) {
          // console.log('match')
          dispatch({ type: 'fetchone',  payload: {model_ID: match[1]}})
        }
      })
    },
  },
}
