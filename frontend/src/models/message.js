import {message} from 'antd'
import {routerRedux} from 'dva/router'
import * as messageService from '../services/message'
import {arrayToJson} from "../utils/JsonUtils"
import pathToRegexp from "path-to-regexp/index"

export default {
  namespace: 'message',

  state: {
    messages: [],
  },

  reducers: {
    setMessage(state, {payload}) {
      return {
        ...state,
        messages: payload.messages,
      }
    },

    updateNewMessage(state, {payload}) {
      console.log('payload')
      console.log(payload)
      let receiver_id = payload.msg.receiver_id
      return {
        ...state,
        messages: {
          ...state.messages,
          [receiver_id]:
            payload.msg.message,
        }
      }
    },

    changeMessageState(state, {payload}) {
      let receiver_id = payload.receiver_id
      return {
        ...state,
        messages: {
          ...state.messages,
          [receiver_id]: {
            ...state.messages[receiver_id],
            is_read: true
          }
        }
      }
    }
  },

  effects: {
    * fetchAllMessage(action, {call, put, select}) {
      // const user_id = yield select(state => state.login.user._id)
      const {data: messages} = yield call(messageService.fetchMessage, {})
      if (messages.length > 0) {
        yield put({
          type: 'setMessage',
          payload: {messages: arrayToJson(messages, 'receiver_id')}
        })
      }
    },

    * readMessage(action, {call, put, select}) {
      let payload = action.payload
      console.log(payload)
      yield call(messageService.readMessage, payload)
      yield put({
        type: 'changeMessageState',
        payload: {receiver_id: payload.receiver_id}
      })
    },
  },

  subscriptions: {
    // 登陆后
    setup({dispatch, history}) {
      return history.listen(({pathname}) => {
        if (pathname === '/') {
          dispatch({
            type: 'fetchAllMessage',
            payload: {}
          })
        }
      })
    },
  },
}

