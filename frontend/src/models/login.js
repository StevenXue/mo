import { login, tokenLogin } from '../services/login'
import { routerRedux } from 'dva/router'
import { queryURL } from '../utils'

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
        const from = queryURL('from')
        yield put({ type: 'setUser', payload: data.user })
        if (from) {
          yield put(routerRedux.push(from))
        } else {
          yield put(routerRedux.push('/projects'))
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
        const from = queryURL('from')
        if (from) {
          yield put(routerRedux.push(from))
        }
        if (location.pathname === '/login') {
          // user dashboard not build yet, push to project by default
          yield put(routerRedux.push('/project'))
        }
      } catch(err) {
        console.log(err)
        if (location.pathname !== '/login') {
          let from = location.pathname
          // window.location = `${location.origin}/login?from=${from}`
          // window.location = `${location.origin}/#/login`
          yield put(routerRedux.push('/login'))

        }
      }
    },
  },
  subscriptions: {
    setup({ dispatch }) {
      console.log('query')
      dispatch({ type: 'query' })
    },
  },
}

