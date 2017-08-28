//MODEL
import { uploadFile, fetchFileList, importData } from '../services/upload'
import { parse } from 'qs'
import lodash from 'lodash'
import { message } from 'antd'
import { Router, routerRedux } from 'dva/router'
import {
  query,
  deleteModel,
  resumeModel,
  suspendModel,
  terminateModel
} from '../services/serving'

export default {

  namespace: 'serving',

  state: {
    models: {
      owned_served_models: [],
      public_served_models: []
    },
    inOperation: false,
  },

  effects: {
    *query ({ payload }, { call, put, select }) {
      const user = yield select(state => state['app'].user)
      const data = yield call(query, user.user_ID)
      if (data) {
        yield put({
          type: 'querySuccess',
          payload: {
            models: data.response,
          },
        })
      } else {
        console.log('error', data)
        throw data
      }
    },

    * toDetail ({ payload }, { call, put, select }) {
      console.log("to detail", payload)
      yield put(
        routerRedux.push({
          pathname: `serving/${payload._id}`,
          query: {
            content: JSON.stringify(payload)
          },
        }),
      )
    },

    *resumeModel ({ payload }, { call, put, select }) {
      const data = yield call(resumeModel, payload)
      if (data) {
        message.success('Model resumed');
        yield put({type: 'query'})
      } else {
        console.log('error', data)
        throw data
      }
    },

    *deleteModel ({ payload }, { call, put, select }) {
      const data = yield call(deleteModel, payload)
      if (data) {
        message.success('Model deleted');
        yield put({type: 'query'})
      } else {
        console.log('error', data)
        throw data
      }
    },

    *suspendModel ({ payload }, { call, put, select }) {
      const data = yield call(suspendModel, payload)
      if (data.success) {
        message.success('Model suspended');
        yield put({type: 'query'})
      } else {
        console.log('error', data)
        throw data
      }
    },

    *terminateModel ({ payload }, { call, put, select }) {
      const data = yield call(terminateModel, payload)
      if (data.success) {
        message.success('Model terminated');
        yield put({type: 'query'})
      } else {
        console.log('error', data)
        throw data
      }
    },
  },

  reducers: {
    querySuccess (state, action) {
      return { ...state, ...action.payload }
    },
  }
}
