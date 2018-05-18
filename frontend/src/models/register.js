import { message } from 'antd'
import { routerRedux } from 'dva/router'
import { register, send_verification_code } from '../services/register'

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

      if(response.status === 200){
        message.success('Register Success!')
        yield put({
          type: 'registerHandle',
          payload: {status: response.status===200?"ok":"failed"},
        })
        yield put({
          type: 'changeSubmitting',
          payload: false,
        })
        yield put(routerRedux.push('/user/login'))
      }else{
        let errorMessage = response.data.error
        message.error(errorMessage)
        yield put({
          type: 'changeSubmitting',
          payload: false,
        })
      }

    },

    *sendVerificationCode({ payload }, { call, put }) {
      const response = yield call(send_verification_code, payload)
      if(response.status === 200){
        message.success('验证码发送成功!')
      }else{
        let errorMessage = response.data.error.message
        message.error(errorMessage)
      }

    }
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
