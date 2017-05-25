import { create } from '../services/project'
import { parse } from 'qs'

export default {

  namespace: 'project',

  state: {},

  effects: {
    *query ({ payload }, { call, put }) {
      // payload = parse(location.search.substr(1))
      const data = yield call(query, payload)
      if (data) {
        yield put({
          type: 'querySuccess',
          payload: {
            list: data.data,
            pagination: {
              // current: Number(payload.page) || 1,
              // pageSize: Number(payload.pageSize) || 10,
              // total: data.total,
            },
          },
        })
      }
    },

    *create ({ payload }, { call, put }) {
      const data = yield call(create, payload)
      if (data.success) {
        yield put({ type: 'hideModal' })
        yield put({ type: 'query' })
      } else {
        throw data
      }
    },
  },

  reducers: {

    querySuccess (state, action) {
      const {} = action.payload
      return {
        ...state,
        // list,
        // pagination: {
        //   ...state.pagination,
        //   ...pagination,
        // }
      }
    },

    showModal (state, action) {
      return { ...state, ...action.payload, modalVisible: true }
    },

    hideModal (state) {
      return { ...state, modalVisible: false }
    },

  },

}
