import { getToolkit } from '../services/toolkit'
import { routerRedux } from 'dva/router'
import { queryURL } from '../utils'

export default {
  namespace: 'toolkit',
  state: {
    toolkits: [],
  },

  effects: {
    *getToolkit ({
            }, { put, call }) {
      const data = yield call(getToolkit)
      if (data.success) {
          yield put({
            type: 'querySuccess',
            payload: {
              data: data.response}
          })
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
