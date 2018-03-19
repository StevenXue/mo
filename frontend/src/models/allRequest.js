import * as userRequestService from '../services/userRequest'
import * as stagingDataService from '../services/stagingData'
import * as userRequestCommentsService from '../services/userRequestComments'
import * as requestAnswerService from '../services/userRequestAnwser'
import * as messageService from '../services/message'
import {arrayToJson, JsonToArray} from '../utils/JsonUtils'
import {getRound} from '../utils/number'
import pathToRegexp from 'path-to-regexp'

// get 此request下所有的的 comment
function* fetchAllCommentsOfThisRequest(action, {call, put}) {
  const {data: allCommentsOfThisRequest} = yield call(userRequestCommentsService.fetchAllCommentsOfThisUserRequest, {user_request_ID: action.payload.userrequestId})
  if (allCommentsOfThisRequest.length > 0) {
    yield put({
      type: 'setAllCommentsOfThisRequest',
      payload: {
        allCommentsOfThisRequest: allCommentsOfThisRequest
      }
    })
  }
}

// get 此request下所有的的 answer 和 comment
function* fetchAllAnswerOfThisRequest(action, {call, put}) {
  const {data: allAnswerOfThisRequest} = yield call(requestAnswerService.fetchAllAnswerOfThisUserRequest, {user_request_ID: action.payload.userrequestId})
  if (allAnswerOfThisRequest.length > 0) {
    allAnswerOfThisRequest.forEach(function(element) {
      element['commentState'] = false
    });
    yield put({
      type: 'setAllAnswerOfThisRequest', payload: {
        allAnswerOfThisRequest: arrayToJson(allAnswerOfThisRequest, '_id')
      }
    })
  }
}

export default {
  namespace: 'allRequest',
  state: {
    //用户拥有的 models
    userRequestDic: {},
    focusUserRequest: null,
    loadingState: false,
    pageNo:1,
    pageSize:10,
    totalNumber:0,
    modalVisible: false,
  },
  reducers: {
    // 获取所有的request
    setAllRequest(state, action) {
      let lengthUserRequest = Object.keys(action.payload.userRequestDic).length
      if (lengthUserRequest !== 0) {
        return {
          ...state,
          userRequestDic: action.payload.userRequestDic,
          totalNumber: action.payload.totalNumber
        }
      }
    },

    showModal(state) {
      return { ...state, modalVisible: true }
    },

    hideModal(state) {
      return { ...state, modalVisible: false }
    },


    changePageNoSize(state, action){
      return {
        ...state,
        pageNo: action.payload.pageNo,
        pageSize:action.payload.pageSize,
      }
    },

    // 点击votesup后 改变 requset 的状态
    updateRequestVotesUp(state, action) {
      let requestAfterVotesUp = action.payload.requestAfterVotesUp
      let request_id = requestAfterVotesUp._id
      if (state.focusUserRequest._id === request_id) {
        return {
          ...state,
          userRequestDic:
            {
              ...state.userRequestDic,
              [request_id]: action.payload.requestAfterVotesUp
            },
          focusUserRequest:
            {
              ...state.focusUserRequest,
              votes_up_user: requestAfterVotesUp.votes_up_user
            }
        }
      }
      else {
        return {
          ...state,
          userRequestDic:
            {
              ...state.userRequestDic,
              [request_id]: action.payload.requestAfterVotesUp
            }
        }
      }
    },


    // 点击star后 改变 requset 的状态
    updateRequestStar(state, action) {
      let requestAfterStar = action.payload.requestAfterStar
      let request_id = requestAfterStar._id
      if (state.focusUserRequest._id === request_id) {
        return {
          ...state,
          userRequestDic:
            {
              ...state.userRequestDic,
              [request_id]: action.payload.requestAfterStar
            },
          focusUserRequest:
            {
              ...state.focusUserRequest,
              star_user: requestAfterStar.star_user
            }
        }
      }
      else {
        return {
          ...state,
          userRequestDic:
            {
              ...state.userRequestDic,
              [request_id]: action.payload.requestAfterStar
            }
        }
      }
    },

// 点击喜爱后 改变 answer 的状态
    updateAnswerVotesUp(state, action) {
      let answerAfterVotesUp = action.payload.answerAfterVotesUp
      let answer_id = answerAfterVotesUp._id
      return {
        ...state,
        focusUserRequest:
          {
            ...state.focusUserRequest,
            answer:
              {
                ...state.focusUserRequest.answer,
                [answer_id]: {
                  ...state.focusUserRequest.answer[answer_id],
                  votes_up_user: answerAfterVotesUp.votes_up_user
                }
              }
          }
      }
    },

// 点击采纳 后 改变 采纳 的状态
    updateAcceptAnswer(state, action) {
      let request_answer_id = action.payload.request_answer_id
      return {
        ...state,
        focusUserRequest:
          {
            ...state.focusUserRequest,
            accept_answer:request_answer_id
          }
      }
    },

    // 切换 focus model
    setFocusUserRequest(state, action) {
      let focusUserRequest = action.payload.focusUserRequest
      focusUserRequest['commentState'] = false
      return {
        ...state,
        focusUserRequest: focusUserRequest,
      }
    },

    // 获取focus model 的所有评论
    setAllCommentsOfThisRequest(state, action) {
      console.log('setAllCommentsOfThisRequest')
      let length = Object.keys(action.payload.allCommentsOfThisRequest).length
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
      let length = Object.keys(action.payload.allAnswerOfThisRequest).length
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


    showLoading(state, action) {
      return {
        ...state,
        loadingState: action.payload.loadingState,
      }
    },

    showAnswerCommentInput(state,action){
      let answer_id = action.payload.request_answer_id
      let commentState = state.focusUserRequest.answer[answer_id].commentState
      return {
        ...state,
        focusUserRequest:
          {
            ...state.focusUserRequest,
            answer:
              {
                ...state.focusUserRequest.answer,
                [answer_id]: {
                  ...state.focusUserRequest.answer[answer_id],
                  commentState: !commentState
                }
              }
          }
      }
    },

    // 获取focus model 的所有评论
    showRequestCommentInput(state, action) {
      let commentState = state.focusUserRequest.commentState
      return {
        ...state,
        focusUserRequest: {
          ...state.focusUserRequest,
          commentState: !commentState,
        }
      }
    },

    clearFocusRequest(state,action){
      return {
        ...state,
        focusUserRequest: null,
      }
    }
  },

  effects: {
    // 获取所有request
    * fetchAllRequest(action, {call, put, select}) {
      let payload =  action.payload
      payload.page_no = yield select(state => state.allRequest.pageNo)
      payload.page_size = yield select(state => state.allRequest.pageSize)
      const {data: {user_request:userRequest,total_number:totalNumber}} = yield call(
        userRequestService.fetchAllUserRequest, payload)
      if (userRequest.length > 0) {
        yield put({
          type: 'setAllRequest',
          payload: {userRequestDic: arrayToJson(userRequest, '_id'),
                    totalNumber:totalNumber}
        })
      }
    },

    * fetchOneRequest(action, {call, put}) {
      yield put({ type: 'clearFocusRequest' })
      const {data: focusUserRequest} = yield call(userRequestService.fetchOneUserRequest,
        {user_request_ID: action.payload.userrequestId})
      yield put({
        type: 'setFocusUserRequest',
        payload: {focusUserRequest: focusUserRequest}
      })
      yield call(fetchAllCommentsOfThisRequest, {payload: {userrequestId: action.payload.userrequestId}}, {
        call, put,
      })

      yield call(fetchAllAnswerOfThisRequest, {payload: {userrequestId: action.payload.userrequestId}}, {
        call, put,
      })
    },
    // 发布新request
    * makeNewRequest(action, {call, put, select}) {
      yield put({type: 'showLoading', payload: {loadingState: true}})
      let payload = action.payload
      // console.log('halo')
      console.log(payload)
      const {data: result} = yield call(userRequestService.createNewUserRequest, payload)
      if (result) {
        yield put({type: 'showLoading', payload: {loadingState: false}})
        yield put({
          type: 'fetchAllRequest',
          payload: {},
        })
      }
    },
    // 发布新 comment
    * makeNewRequestComment(action, {call, put, select}) {
      const user_ID = yield select(state => state.login.user.user_ID)
      const user_request_id = yield select(state => state.allRequest.focusUserRequest._id)
      let payload = action.payload
      payload.user_id = user_ID
      payload.user_request_id = user_request_id
      // console.log('payload')
      // console.log(payload)
      const {data: result} = yield call(userRequestCommentsService.createNewUserRequestComments, payload)

      if (result) {
        yield call(fetchAllCommentsOfThisRequest, {payload: {userrequestId: payload.user_request_id}}, {
          call, put
        })
        yield call(fetchAllAnswerOfThisRequest, {payload: {userrequestId: payload.user_request_id}}, {
          call, put
        })
      }
    },
    // 发布新回答
    * makeNewRequestAnswer(action, {call, put, select}) {
      const user_request_id = yield select(state => state.allRequest.focusUserRequest._id)
      let payload = action.payload
      payload.user_request_id = user_request_id
      // console.log(payload)
      const {data: result} = yield call(requestAnswerService.createNewUserRequestAnswer, payload)
      if (result) {
        yield call(fetchAllAnswerOfThisRequest, {payload: {userrequestId: payload.user_request_id}}, {
          call, put
        })
      }
    },

    * votesUpRequest(action, {call, put, select}) {
      let payload = action.payload
      payload['votes_user_id'] = yield select(state => state.login.user.user_ID)
      const {data: requestAfterVotesUp} = yield call(userRequestService.votesUpRequest, payload)
      yield put({
        type: 'updateRequestVotesUp',
        payload: {requestAfterVotesUp: requestAfterVotesUp}
      })
    },

    * starRequest(action, {call, put, select}) {
      let payload = action.payload
      payload['star_user_id'] = yield select(state => state.login.user.user_ID)
      const {data: requestAfterStar} = yield call(userRequestService.starRequest, payload)
      yield put({
        type: 'updateRequestStar',
        payload: {requestAfterStar: requestAfterStar}
      })
    },

    * votesUpAnswer(action, {call, put, select}) {
      let payload = action.payload
      payload['votes_user_id'] = yield select(state => state.login.user.user_ID)
      const {data: answerAfterVotesUp} = yield call(requestAnswerService.votesUpAnswer, payload)
      yield put({
        type: 'updateAnswerVotesUp',
        payload: {answerAfterVotesUp: answerAfterVotesUp}
      })
    },

    * acceptAnswer(action, {call, put, select}) {
      let payload = action.payload
      yield call(requestAnswerService.acceptAnswer, payload)
      yield put({
        type: 'updateAcceptAnswer',
        payload: {request_answer_id:payload.request_answer_id}
      })
    },

    * deleteUserRequest(action, {call, put, select}){
      let payload = action.payload
      yield call(userRequestService.removeRequest, payload)
    }
  },

  subscriptions: {
    // 当进入该页面是 获取所有用户所有 request
    setup({dispatch, history}) {
      return history.listen(({pathname}) => {
        const match = pathToRegexp('/userrequest/:userrequestId').exec(pathname)
        if (pathname === '/userrequest') {
          // dispatch({
          //   type: 'fetchAllRequest',
          //   payload: {}
          // })
        } else if (match) {
          console.log('match')
          dispatch({
            type: 'fetchOneRequest',
            payload: {userrequestId: match[1]}
          })
        }
      })
    },
  },
}
