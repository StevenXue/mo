import * as userRequestService from '../services/userRequest';
import * as stagingDataService from '../services/stagingData';
import {arrayToJson} from '../utils/JsonUtils';
import {getRound} from '../utils/number';
import pathToRegexp from 'path-to-regexp';

export default {
  namespace: 'allRequest',
  state: {
    //用户拥有的 models
    userRequestJson: [],
    loadingState: false,
    modalState:false
  },
  reducers: {
    // 获取所有的models
    setModels(state, action) {
      let lengthUserRequestJson = Object.keys(action.payload.userRequestJson).length;
      if (lengthUserRequestJson !== 0) {
        return {
          ...state,
          userRequestJson: action.payload.userRequestJson,
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
    changeModelStatus: function (state, action) {
      let newInfo = {
        ...state.modelsJson[state.focusModelId]['served_model'],
        status: action.payload.status,
        server: action.payload.server,
      };
      // 使用新的 server 替换旧的，防止 用户undeploy后又resume导致server信息不更新的问题
      let how_to_use_code = state.modelsJson[state.focusModelId]['how_to_use_code'];
      if (action.payload.status === 'serving') {
        for (let each_code of Object.keys(how_to_use_code)) {
          how_to_use_code[each_code] = how_to_use_code[each_code].replace(/\"[0-9]*\.[0-9]*\.[0-9]*\.[0-9]*\:[0-9]*/, '"' + action.payload.server)
        }
      }
      console.log('action.payload.server')
      console.log(action.payload.server)
      return {
        ...state,
        modelsJson: {
          ...state.modelsJson,
          [state.focusModelId]: {
            ...state.modelsJson[state.focusModelId],
            ['how_to_use_code']: how_to_use_code,
            ['served_model']: newInfo,
          }
        }
      }
    },
  },
  effects: {
    // 获取所有request
    * fetchAllRequest(action, {call, put}) {
      const {data: {[action.payload.categories]: models}} = yield call(userRequestService.fetchAllUserRequest, {});
      // array to json
      const modelsJson = arrayToJson(models, '_id');
      // 查询 部署的状态
      yield put({type: 'setUserRequest', payload: {modelsJson: modelsJson}})
    },

    // 发布新request
    makeNewRequest: function* (action, {call, put, select}) {
      yield put({type: 'showLoading', payload: {loadingState: true}});
      const user_ID = yield select(state => state.login.user.user_ID);
      let payload = action.payload;
      payload.user_ID = user_ID;
      console.log(payload);

      const {data: result} = yield call(userRequestService.createNewUserRequest, payload);
      if (result) {
        yield put({type: 'showLoading', payload: {loadingState: false}});
        yield put({
          type: 'fetchAllRequest',
          payload: {},
        });
      }
    },


  },
  subscriptions: {
    // 当进入该页面是 获取用户所有 Models
    setup({dispatch, history}) {
      return history.listen(({pathname}) => {
        const match = pathToRegexp('/workspace/:projectId/deploy').exec(pathname);
        if (match) {
          const projectId = match[1];
          // console.log('projectId')
          // console.log(projectId)
          dispatch({
            type: 'fetchModels',
            payload: {projectId: projectId, categories: 'userRequest'},
          });
        }
      });
    },
  },
};
