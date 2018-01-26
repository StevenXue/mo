import {routerRedux} from 'dva/router'
import pathToRegexp from 'path-to-regexp'
import {tokenLogin} from '../services/login'
import {
  fetchProjects,
  createProject,
  deleteProject,
  updateProject
} from '../services/project'
import {
  fetchAllPublicServedModels,
  fetchOnePublicServedModels,
  search_served_models
} from '../services/deployedmodels'
import {privacyChoices} from '../constants'
import {arrayToJson} from '../utils/JsonUtils';
import * as deploymentService from '../services/deployment';

export default {
  namespace: 'publicServedModels',
  state: {
    modelsJson: [],
    focusModel: null,
    skipping: 0,
    category: 'All',
  },
  reducers: {
    setPublicServedModels(state, action) {
      return {
        ...state,
        modelsJson: action.payload.modelsJson,
        skipping: 10,
      }
    },

    addPublicServedModels(state, action) {
      let newInfo = {
        ...state.modelsJson,
        ...action.payload.modelsJson,
      };

      return {
        ...state,
        modelsJson: newInfo,
        skipping: action.payload.skipping + 10,
      }
    },


    setFocusModels(state, action) {
      return {
        ...state,
        focusModel: action.payload.model,
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
          0: newInfo
        }
      }
    },
  },
  effects: {
    // fetch 10
    * fetch(action, {call, put, select, take}) {

      const {data: models} = yield call(fetchAllPublicServedModels, {
        privacy: false, category: action.payload.category, skipping: action.payload.skipping
      })
      const modelsJson = arrayToJson(models, '_id')
      // console.log('modelsJson')
      // console.log(modelsJson)
      if (action.payload.skipping === 0){
        yield put({
          type: 'setPublicServedModels',
          payload: {modelsJson: modelsJson,
             category:action.payload.category}
        })
      }
      else{
        yield put({
          type: 'addPublicServedModels',
          payload: {modelsJson: modelsJson,category:action.payload.category,
            skipping:action.payload.skipping}
        })
      }


    },

    * fetchone(action, {call, put, select, take}) {
      const {data: model} = yield call(fetchOnePublicServedModels, {
        model_ID: action.payload.model_ID
      })
      yield put({type: 'setFocusModels', payload: {model: model}})
    },


    * search(action, {call, put, select, take}) {
      const {data: modelsJson} = yield call(search_served_models, {
        searchStr: action.payload.searchStr
      })
      yield put({
        type: 'setPublicServedModels',
        payload: {modelsJson: modelsJson,
          category:action.payload.category}
      })
    },

    * getPrediction(action, {call, put, select}) {
      const user_ID = yield select(state => state.login.user.user_ID);
      let payload = action.payload;
      payload.served_model_id = yield select(state => state.publicServedModels.focusModel[0]['_id']);
      payload.server = yield select(state => state.publicServedModels.focusModel[0]['server']);
      // payload.name=yield select(state => state.deployment.modelsJson[focusModelId]['served_model']['name']);
      payload.model_name = yield select(state => state.publicServedModels.focusModel[0]['model_name']);
      payload.features = yield select(state => state.publicServedModels.focusModel[0]['data_fields'][0]);
      const {data: result} = yield call(deploymentService.getPrediction, payload);
      yield put({type: 'getPredictionR', payload: result});
    },
  },
  subscriptions: {
    // 当进入该页面是 获取用户所有 project
    setup({dispatch, history}) {
      return history.listen(({pathname}) => {
        const match = pathToRegexp('/modelmarket/:modelsId').exec(pathname)
        if (pathname === '/modelmarket') {
          dispatch({
            type: 'fetch',
            payload: {privacy: 'public', category: 'All',skipping: 0,}
          })
        } else if (match) {
          console.log('match')
          dispatch({type: 'fetchone', payload: {model_ID: match[1]}})
        }
      })
    },
  },
}
