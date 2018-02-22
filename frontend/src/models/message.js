import { message } from 'antd'
import { routerRedux } from 'dva/router'
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
  },

  effects: {
    * fetchAllMessage(action, {call, put, select}) {
      // const user_id = yield select(state => state.login.user._id)
      const {data: messages} = yield call(messageService.fetchMessage, {})
      if (messages.length > 0) {
        yield put({
          type: 'setMessage',
          payload: {messages: messages}
        })
      }
    },
  },

  subscriptions: {
    // 登陆后
    setup({dispatch, history}) {
      return history.listen(({pathname}) => {
        if (pathname === '/userrequest') {
          console.log('????kkkkkk')
          dispatch({
            type: 'fetchAllMessage',
            payload: {}
          })
        }
      })
    },
  },
}

