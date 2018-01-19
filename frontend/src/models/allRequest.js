import * as userRequestService from '../services/userRequest';
import * as stagingDataService from '../services/stagingData';
import * as userRequestCommentsService from '../services/userRequestComments';



import {arrayToJson} from '../utils/JsonUtils';
import {getRound} from '../utils/number';
import pathToRegexp from 'path-to-regexp';

export default {
  namespace: 'allRequest',
  state: {
    //用户拥有的 models
    userRequest: [],
    focusUserRequest: null,
    loadingState: false,
    modalState:false
  },
  reducers: {
    // 获取所有的models
    setAllRequest(state, action) {
      let lengthUserRequest = Object.keys(action.payload.userRequest).length;
      if (lengthUserRequest !== 0) {
        return {
          ...state,
          userRequest: action.payload.userRequest,
          }
        }
    },

    // 切换 focus model
    setFocusUserRequest(state, action) {
      return {
        ...state,
        focusUserRequest: action.payload.focusUserRequest,
      }
    },

    // 获取focus model 的所有评论
    setAllCommentsOfThisRequest(state, action) {
      let length = Object.keys(action.payload.allCommentsOfThisRequest).length;
      if (length !== 0) {
        return {
          ...state,
          focusUserRequest: {
            ...state.focusUserRequest,
            comments: action.payload.allCommentsOfThisRequest,
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
  },

  effects: {
    // 获取所有request
    * fetchAllRequest(action, {call, put}) {
      const {data: userRequest} = yield call(userRequestService.fetchAllUserRequest, {});
      if (userRequest.length>0) {
        yield put({type: 'setAllRequest', payload: {userRequest: userRequest}})
      }
    },

    * fetchOneRequest(action, {call, put}) {
      const {data: focusUserRequest} = yield call(userRequestService.fetchOneUserRequest,
        {user_request_ID:action.payload.userrequestId});
      yield put({type: 'setFocusUserRequest', payload: {focusUserRequest: focusUserRequest}})
      const {data: allCommentsOfThisRequest} = yield call(userRequestCommentsService.
        fetchAllCommentsOfThisUserRequest, {user_request_ID:action.payload.userrequestId});
      console.log(allCommentsOfThisRequest)
      if (allCommentsOfThisRequest.length>0) {
        yield put({type: 'setAllCommentsOfThisRequest', payload: {
          allCommentsOfThisRequest: allCommentsOfThisRequest}})}
    },

    // 发布新request
    * makeNewRequest(action, {call, put, select}) {
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


    * fetchAllCommentsOfThisRequest(action, {call, put}) {
      console.log('action')
      const {data: allCommentsOfThisRequest} = yield call(userRequestCommentsService.
        fetchAllCommentsOfThisUserRequest, {user_request_ID:action.payload.userrequestId});
      console.log(allCommentsOfThisRequest)
      if (allCommentsOfThisRequest.length>0) {
        yield put({type: 'setAllCommentsOfThisRequest', payload: {
          allCommentsOfThisRequest: allCommentsOfThisRequest}})}
    },

    // 发布新request
    * makeNewRequestComment (action, {call, put, select}) {
      const user_ID = yield select(state => state.login.user.user_ID);
      const user_request_id = yield select(state => state.allRequest.focusUserRequest._id)
      let payload = action.payload;
      payload.user_id = user_ID;
      payload.user_request_id = user_request_id;
      console.log(payload);
      const {data: result} = yield call(userRequestCommentsService.createNewUserRequestComments, payload);
      if (result) {
        yield put({
          type: 'fetchAllCommentsOfThisRequest',
          payload: {userrequestId:user_request_id},
        });
      }
    },

  },
  subscriptions: {
    // 当进入该页面是 获取用户所有 Models
    setup({dispatch, history}) {
      return history.listen(({pathname}) => {
        const match = pathToRegexp('/userrequest/:userrequestId').exec(pathname)
        if (pathname === '/userrequest') {
          dispatch({
            type: 'fetchAllRequest',
            payload: {}
          })
        } else if (match) {
          console.log('match')
          dispatch({type: 'fetchOneRequest', payload: {userrequestId: match[1]}})
          // dispatch({type: 'fetchAllCommentsOfThisRequest', payload: {userrequestId: match[1]}})
        }
      })
    },
  },
};
