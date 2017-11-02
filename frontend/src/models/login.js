import { login, tokenLogin } from '../services/login'
import { routerRedux } from 'dva/router'
import pathToRegexp from 'path-to-regexp'
import io from 'socket.io-client'

import { queryURL } from '../utils'

import { flaskServer } from '../constants'

export default {
  namespace: 'login',
  state: {
    loginLoading: false,
  },
  reducers: {
    showLoginLoading(state) {
      return {
        ...state,
        loginLoading: true,
      }
    },
    hideLoginLoading(state) {
      return {
        ...state,
        loginLoading: false,
      }
    },
    setUser(state, { payload: user }) {
      return {
        ...state,
        user,
      }
    },
    resetUser(state, { payload: user }) {
      return {
        ...state,
        user: undefined,
      }
    },
  },
  effects: {
    *login({
             payload,
           }, { put, call }) {
      yield put({ type: 'showLoginLoading' })
      const { data: data } = yield call(login, payload)
      yield put({ type: 'hideLoginLoading' })
      if (data) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user_ID', data.user.user_ID)
        const from = queryURL('from')
        yield put({ type: 'setUser', payload: data.user })
        if (from) {
          yield put(routerRedux.push(from))
        } else {
          yield put(routerRedux.push('/workspace'))
        }
      } else {
        throw data
      }
    },
    *query({ payload }, { call, put }) {
      try {
        const { data: data } = yield call(tokenLogin)
        yield put({
          type: 'setUser',
          payload: data.user,
        })
        // FIXME regex can't catch whole url
        // const from = queryURL('from')
        // if (from) {
        //   yield put(routerRedux.push(from))
        // }
        console.log(location.hash.substr(1))
        if (location.hash.substr(1) === '/login') {
          // user dashboard not build yet, push to project by default
          yield put(routerRedux.push('/workspace'))
        }
      } catch (err) {
        console.log(err)
        if (location.pathname !== '/login') {
          let from = location.pathname
          // window.location = `${location.origin}/login?from=${from}`
          // window.location = `${location.origin}/#/login`
          yield put(routerRedux.push('/login'))
        }
      }
    },
    *handleSocket({ payload }, { call, put }) {
      const { message, pathname } = payload
      const projectIdMsg = message.project_id
      const jobIdMsg = message.job_id
      const match = pathToRegexp('/workspace/:projectId*').exec(pathname)
      if(match) {
        const projectId = match[1]
        if(projectId === projectIdMsg) {
          // in project
          yield put({
            type: 'modelling/setMetrics',
            payload: {message}
          })
        }
      }
    },
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname }) => {
        const match = pathToRegexp('/login').exec(pathname)
        if (!match) {
          dispatch({ type: 'query' })
        }
        // dispatch({ type: 'handleSocket', payload: { message:'', pathname } })
        const userId = localStorage.getItem('user_ID')
        if (userId) {
          const socket = io.connect(flaskServer + '/log/' + userId)
          socket.on('log_epoch_end', (message) => {
            dispatch({ type: 'handleSocket', payload: { message, pathname } })
          })
        }
      })
    },
  },
}

