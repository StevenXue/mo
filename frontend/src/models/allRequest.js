import * as userRequestService from '../services/userRequest';
import * as stagingDataService from '../services/stagingData';
import * as userRequestCommentsService from '../services/userRequestComments';
import * as userRequestAnswerService from '../services/userRequestAnwser'

import {arrayToJson} from '../utils/JsonUtils';
import {getRound} from '../utils/number';
import pathToRegexp from 'path-to-regexp';

// get 此request下所有的的 comment
function *fetchAllCommentsOfThisRequest(action, {call, put}) {
  const {data: allCommentsOfThisRequest} = yield call(userRequestCommentsService.
    fetchAllCommentsOfThisUserRequest, {user_request_ID:action.payload.userrequestId});
  if (allCommentsOfThisRequest.length>0) {
    yield put({type: 'setAllCommentsOfThisRequest', payload: {
        allCommentsOfThisRequest: allCommentsOfThisRequest}})}
}

// get 此request下所有的的 answer 和 comment
function *fetchAllAnswerOfThisRequest(action, {call, put}) {
  console.log('action')
  const {data: allAnswerOfThisRequest} = yield call(userRequestAnswerService.
    fetchAllAnswerOfThisUserRequest, {user_request_ID:action.payload.userrequestId});
  console.log(allAnswerOfThisRequest)
  if (allAnswerOfThisRequest.length>0) {
    yield put({type: 'setAllAnswerOfThisRequest', payload: {
        allAnswerOfThisRequest: allAnswerOfThisRequest}})}
}

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

    // 获取focus model 的所有答案
    setAllAnswerOfThisRequest(state, action) {
      let length = Object.keys(action.payload.allAnswerOfThisRequest).length;
      if (length !== 0) {
        return {
          ...state,
          focusUserRequest: {
            ...state.focusUserRequest,
            answer: action.payload.allAnswerOfThisRequest,
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
        {user_request_ID: action.payload.userrequestId});
      yield put({
        type: 'setFocusUserRequest',
        payload: {focusUserRequest: focusUserRequest}
      })
      yield call(fetchAllCommentsOfThisRequest, {payload: {userrequestId: action.payload.userrequestId}}, {
        call, put,})

      yield call(fetchAllAnswerOfThisRequest, {payload: {userrequestId: action.payload.userrequestId}}, {
        call, put,})
    },
    // 发布新request
    * makeNewRequest(action, {call, put, select}) {
      yield put({type: 'showLoading', payload: {loadingState: true}});
      const user_ID = yield select(state => state.login.user.user_ID);
      let payload = action.payload;
      payload.user_ID = user_ID;
      console.log('halo');
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
    // 发布新 comment
    * makeNewRequestComment (action, {call, put, select}) {
      const user_ID = yield select(state => state.login.user.user_ID);
      const user_request_id = yield select(state => state.allRequest.focusUserRequest._id)
      let payload = action.payload;
      payload.user_id = user_ID;
      payload.user_request_id = user_request_id;
      console.log('payload');
      console.log(payload);
      const {data: result} = yield call(userRequestCommentsService.createNewUserRequestComments, payload);
      if (result) {
        yield call(fetchAllCommentsOfThisRequest, {payload: {userrequestId: payload.user_request_id}}, {
          call, put})
        yield call(fetchAllAnswerOfThisRequest, {payload: {userrequestId: payload.user_request_id}}, {
          call, put})
      }
    },
    // 发布新回答
    * makeNewRequestAnswer (action, {call, put, select}) {
      const user_ID = yield select(state => state.login.user.user_ID);
      const user_request_id = yield select(state => state.allRequest.focusUserRequest._id)
      let payload = action.payload;
      payload.user_id = user_ID;
      payload.user_request_id = user_request_id;
      console.log(payload);
      const {data: result} = yield call(userRequestAnswerService.createNewUserRequestAnswer, payload);
      if (result) {
        yield call(fetchAllAnswerOfThisRequest, {payload: {userrequestId: payload.user_request_id}}, {
          call, put})
      }
    },

    * votesUpRequest(action, {call, put, select}) {
      let payload = action.payload;
      payload['votes_user_id'] = yield select(state => state.login.user.user_ID);
      const {data: userRequest} = yield call(userRequestService.votesUpRequest, payload);
      if (userRequest.length>0) {
        yield put({type: 'setAllRequest', payload: {userRequest: userRequest}})
      }
    },
  },
  subscriptions: {
    // 当进入该页面是 获取所有用户所有 request
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
        }
      })
    },
  },
};
