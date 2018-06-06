import * as worldMessageService from '../services/worldMessage'
import _ from 'lodash'

import io from 'socket.io-client'
import { flaskServer, translateDict } from '../constants'

let connected = false

export default {
  namespace: 'worldChannel',
  state: {
    worldMessages: [],
    isRight: false,
  },

  reducers: {
    updateState(state, { payload }) {
      return { ...state, ...payload }
    },

    updateWorldMessages(state, { payload }) {
      console.log('updateWorldMessages')
      // const {worldMessages} = state
      const { newMessage } = payload

      let worldMessages = JSON.parse(JSON.stringify(state.worldMessages))
      worldMessages.push(newMessage)

      return {
        ...state,
        worldMessages,
      }
    },

    // ?这种是不是纯函数 ,更换到effects里是解决方案吗
    toggleIsRight(state, { payload }) {
      return {
        ...state,
        isRight: !state.isRight,
      }
    },

  },

  effects: {
    *getWorldMessages({ payload }, { call, put }) {
      // 上面的是早的， 只显示今天的或者50条，没有分页
      const result = yield call(worldMessageService.getWorldMessages, payload)
      yield put({ type: 'updateState', payload: { worldMessages: _.reverse(result.data.objects) } })

      payload.scrollToBottom(true)
    },

    *sendMessage({ payload }, { call, put }) {
      const result = yield call(worldMessageService.sendWorldMessages, payload)
      console.log('result', result)

    },

  },

  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname }) => {
        const userId = localStorage.getItem('user_ID')
        if (userId && !connected) {
          const socket = io.connect('/log', { path: '/socketio/socket.io' })
          socket.on('world', (msg) => {
            console.log('msg', msg)
            dispatch({ type: 'updateWorldMessages', payload: { newMessage: msg } })
          })
          connected = true
        }
      })
    },
  },

}
