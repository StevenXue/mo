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
      console.log('message')
      const user_id = yield select(state => state.login.user._id)
      console.log(user_id)
      const {data: message} = yield call(messageService.fetchMessage, {user_id})
      console.log('message')
      console.log(message)
      if (message.length > 0) {
        yield put({
          type: 'setMessage',
          payload: {message: message}
        })
      }
    },
  },

  subscriptions: {
    // 登陆后
    // setup({dispatch, history}) {
    //   return history.listen(({pathname}) => {
    //     if (pathname === '/userrequest') {
    //       dispatch({
    //         type: 'fetchAllMessage',
    //         payload: {}
    //       })
    //     }
    //   })
    // },
  },
}

