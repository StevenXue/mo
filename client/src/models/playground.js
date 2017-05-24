import { spawn } from '../services/playground'
import { routerRedux } from 'dva/router'
import { queryURL } from '../utils'

export default {
  namespace: 'playground',
  state: {
    loginLoading: false,
  },

  effects: {
    *spawn ({
              payload,
            }, { put, call }) {
      yield put({ type: 'showLoginLoading' })
      const data = yield call(spawn, payload)
      yield put({ type: 'hideLoginLoading' })
      if (data.success) {
        // const from = queryURL('from')
        // yield put({ type: 'app/query' })
        // if (from) {
        //   yield put(routerRedux.push(from))
        // } else {
        //   yield put(routerRedux.push('/project'))
        // }
      } else {
        throw data
      }
    },
  },
  reducers: {
    showLoginLoading (state) {
      return {
        ...state,
        loginLoading: true,
      }
    },
    hideLoginLoading (state) {
      return {
        ...state,
        loginLoading: false,
      }
    },
  },
}
