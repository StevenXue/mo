import { message } from 'antd'
import { routerRedux } from 'dva/router'
import { register } from '../services/register'

export default {
  namespace: 'register',

  state: {
    status: undefined,
  },

  effects: {
    *submit({ payload }, { call, put }) {
      yield put({
        type: 'changeSubmitting',
        payload: true,
      })
      const response = yield call(register, payload)
      message.success('Register Success!')
      yield put({
        type: 'registerHandle',
        payload: response,
      })
      yield put({
        type: 'changeSubmitting',
        payload: false,
      })
      yield put(routerRedux.push('/user/login'))
    },
  },

  reducers: {
    registerHandle(state, { payload }) {
      return {
        ...state,
        status: payload.status,
      }
    },
    changeSubmitting(state, { payload }) {
      return {
        ...state,
        submitting: payload,
      }
    },
  },
}
