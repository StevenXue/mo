import lodash from 'lodash'
import { parse } from 'qs'
import { message } from 'antd'
import { Router, routerRedux } from 'dva/router'
import {
  query,
  create,
  edit,
  listDataSets,
  publishProject,
  forkProject,
  listFiles,
  getStagedData,
  convertToStaging,
  predictNeuralStyle,
  listToolkits
} from '../services/project'

export default {

  namespace: 'project',

  state: {
    dataSets: {
      public_ds: [],
      owned_ds: [],
    },
    fileList: {
      public_files: [],
      owned_files: [],
    },
    loading: false,
    files: [],
    predictFileList: {
      public_files: [],
      owned_files: [],
    },
    predictFiles: [],
    predictImages: [],
    projects: {
      public_projects: [],
      owned_projects: [],
    },
    toolkits:{},
    selectedDSIds: [],
    stagingData: [],
    predictLoading: false,
    predictEnd: false,
    predictModelType: 6,
  },

  effects: {
    * query ({ payload }, { call, put, select }) {
      const user = yield select(state => state['app'].user)
      yield put({
        type: 'querySuccess',
        payload: {
          user: user,
        },
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

    * toDetail ({ payload }, { call, put, select }) {
      console.log('to detail', payload)
      const user = yield select(state => state['app'].user)
      yield put(
        routerRedux.push({
          pathname: `project/${payload.name}`,
          query: {
            _id: payload._id,
            user: user,
          },
        }),
      )
    },

    * fork ({ payload }, { call, put, select }) {
      const user = yield select(state => state['app'].user)
      console.log('fork', payload, user.user_ID)
      const data = yield call(forkProject, payload, user.user_ID)
      if (data.success) {
        const res = yield call(query, user.user_ID)
        if (res) {
          yield put({
            type: 'querySuccess',
            payload: {
              projects: res.response,
            },
          })
        } else {
          console.log('error', res)
          throw res
        }
      } else {
        console.log('error', data)
        throw data
      }
    },

    * publish ({ payload }, { call, put, select }) {
      console.log('to detail', payload)
      const data = yield call(publishProject, payload)
      const user = yield select(state => state['app'].user)
      if (data.success) {
        const res = yield call(query, user.user_ID)
        if (res) {
          yield put({
            type: 'querySuccess',
            payload: {
              projects: res.response,
            },
          })
        } else {
          console.log('error', res)
          throw res
        }
      } else {
        console.log('error', data)
        throw data
      }
    },

    * listDataSets ({ payload }, { call, put, select }) {
      const user = yield select(state => state['app'].user)
      const data = yield call(listDataSets, user.user_ID)
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

    * getStagingDatasets ({ payload }, { call, put, select }) {
      let body = lodash.cloneDeep(payload)
      console.log('fetch staging data')
      const data = yield call(getStagedData, body)
      if (data.success) {
        yield put({
          type: 'querySuccess',
          payload: {
            stagingData: data.response,
          },
        })
      } else {
        console.log('error', data)
        throw data
      }
    },

    * toStagingData ({ payload }, { call, put, select }) {
      yield put({ type: 'loadingStart' })
      const data = yield call(convertToStaging, payload)
      if (data.success) {
        yield put({
          type: 'getStagingDatasets',
          payload: payload.project_id
        });
        yield put({ type: 'loadingEnd' })
        message.success("dataset has been successfully staged");
      } else {
        console.log('error', data, payload)
        throw data
      }
    },

    *listToolkit ({ payload }, { call, put, select }) {
      const data = yield call(listToolkits)
      console.log("listing toolkit", data.response)
      if (data.success) {
        yield put({
          type: 'querySuccess',
          payload: {
            toolkits: data.response
          },
        })
      } else {
        console.log('error', data)
        throw data
      }
    },

    *listFiles ({ payload }, { call, put, select }) {
      const user = yield select(state => state['app'].user)
      const predict = payload['predict']
      const extension = payload['extension']
      const data = yield call(listFiles, user.user_ID, extension, predict)

      if (data.success) {
        console.log(data.response)
        let payload
        if (predict === true) {
          let allFiles = data.response['owned_files'].concat(data.response['public_files'])
          payload = {
            predictFileList: data.response,
            predictFiles: allFiles,
          }
        } else {
          payload = {
            fileList: data.response,
            files: data.response['owned_files'].concat(data.response['public_files']),
          }
        }
        yield put({
          type: 'querySuccess',
          payload,
        })
      } else {
        console.log('error', data)
        throw data
      }
    },

    * edit ({ payload }, { call, put }) {
      const data = yield call(edit, payload)
      if (data.success) {
        yield put({ type: 'query' })
      } else {
        throw data
      }
    },

    * create ({ payload }, { call, put, select }) {
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

    * doPredict ({ payload }, { call, put, select }) {
      const user_ID = yield select(state => state['app'].user.user_ID)
      let body = {
        user_ID,
        ...payload
      }
      yield put({ type: 'predictStart' })
      const data = yield call(predictNeuralStyle, body)
      yield put({ type: 'predictEnd' })
      if (data.success) {
        console.log('success', data.response)
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

    predictQuerySuccess (state, action) {
      return { ...state, ...action.payload }
    },

    showModal (state, action) {
      return { ...state, ...action.payload, modalVisible: true }
    },

    loadingStart (state, action) {
      return { ...state, loading: true }
    },

    loadingEnd (state, action) {
      return { ...state, loading: false }
    },

    hideModal (state) {
      return { ...state, modalVisible: false }
    },

    selectDataSets (state, action) {
      console.log('action', action)
      return { ...state, ...action.payload }
    },

    setActiveKey (state, { payload: activeKey }) {
      return {
        ...state,
        activeKey,
      }
    },

    selectPredictImage (state, { payload: predictImages }) {
      return { ...state, predictImages }
    },

    predictStart (state) {
      return {
        ...state,
        predictLoading: true,
        predictEnd: false,
      }
    },

    predictEnd (state) {
      return {
        ...state,
        predictLoading: false,
        predictEnd: true,
      }
    },

    setPredictInfo (state, action) {
      return {
        ...state,
        ...action.payload,
      }
    },
  },

}
