import { create, edit, listDataSets } from '../services/project';
import { parse } from 'qs';

export default {

  namespace: 'project',

  state: {
    dataSets: {
      public_ds: [],
      owned_ds: [],
    },
    selectedDSIds: []
  },

  effects: {
    *query ({ payload }, { call, put }) {
      //payload = parse(location.search.substr(1))
      const data = yield call(query, payload)
      if (data) {
        yield put({
          type: 'querySuccess',
          payload: {
            list: data.data
          },
        })
      }
    },

    *listDataSets ({ payload }, { call, put, select }) {
      const user = yield select(state => state['app'].user);
      const data = yield call(listDataSets, user.user_ID)
      console.log('listDataSets', data)
      if (data.success) {
        yield put({
          type: 'querySuccess',
          payload: {
            dataSets: data.response
          },
        })
      } else {
        console.log('error', data);
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
      return { ...state, ...action.payload }
    },

    showModal (state, action) {
      return { ...state, ...action.payload, modalVisible: true }
    },

    hideModal (state) {
      return { ...state, modalVisible: false }
    },

    selectDataSets (state, action) {
      return { ...state, ...action.payload }
    },

  }

}
