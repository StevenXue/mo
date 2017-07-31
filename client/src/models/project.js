import lodash from 'lodash'
import { parse } from 'qs'
import { message } from 'antd'
import { Router, routerRedux } from 'dva/router'
import { query, create, edit, listDataSets } from '../services/project'

export default {

  namespace: 'project',

  state: {
    dataSets: {
      public_ds: [],
      owned_ds: [],
    },
    projects: {
      public_projects: [],
      owned_projects: [],
    },
    selectedDSIds: [],
  },

  effects: {
    *query ({ payload }, { call, put, select }) {
      const user = yield select(state => state['app'].user)
      yield put({
        type: 'querySuccess',
        payload: {
          user: user,
        }
      })
      const data = yield call(query, user.user_ID)
      if (data) {
        yield put({
          type: 'querySuccess',
          payload: {
            projects: data.response,
          },
        })
      } else {
        console.log('error', data)
        throw data
      }
    },

    *toDetail ({ payload }, { call, put, select }) {
      console.log("to detail", payload);
      const user = yield select(state => state['app'].user)
      yield put(
        routerRedux.push({
        pathname: `project/${payload.name}`,
        query: {
          _id: payload._id,
          user: user
        },
      })
      )
    },



    *listDataSets ({ payload }, { call, put, select }) {
      const user = yield select(state => state['app'].user)
      const data = yield call(listDataSets, user.user_ID)
      console.log('listDataSets', data)
      if (data.success) {
        yield put({
          type: 'querySuccess',
          payload: {
            dataSets: data.response,
          },
        })
      } else {
        console.log('error', data)
        throw data
      }
    },

    *edit ({ payload }, { call, put }) {
      const data = yield call(edit, payload)
      if (data.success) {
        yield put({ type: 'query' })
      } else {
        throw data
      }
    },

    *create ({ payload }, { call, put, select }) {
      const user = yield select(state => state['app'].user)
      let body = lodash.cloneDeep(payload)
      body['user_ID'] = user.user_ID
      const data = yield call(create, body)
      if (data.success) {
        message.success('create success')
        yield put({ type: 'query' })
        yield put({ type: 'hideModal' })
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

    showModal (state, action) {
      return { ...state, ...action.payload, modalVisible: true }
    },

    hideModal (state) {
      return { ...state, modalVisible: false }
    },

    selectDataSets (state, action) {
      console.log('action', action)
      return { ...state, ...action.payload }
    },

  },

}
