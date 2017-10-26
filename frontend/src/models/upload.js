import { uploadFile, fetchDataSets, fetchDataSet } from '../services/upload'
import { parse } from 'qs'
import lodash from 'lodash'
import { message } from 'antd'
import pathToRegexp from 'path-to-regexp';
import {routerRedux} from 'dva/router';

export default {
  namespace: 'upload',

  state: {
    uploading: false,
    dataSets: {
      public_ds: [],
      owned_ds: [],
    },
    dataSet: [],
    dataSetID: '',

  },

  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname }) => {
        const match = pathToRegexp('/projects/:projectId/import/select').exec(pathname);


        if (match) {
          dispatch({ type: 'fetch' })
        }


      })
    },

  },


  effects: {

    * fetch(action, { call, put, select }) {

      let user_ID = 'dev_1'
      const data = yield call(fetchDataSets, user_ID)
      console.log(data)
      yield put({ type: 'setDataSets', payload: data.data })

    },

    * show(action, { call, put, select }) {
      const dataSetID = yield select(state => state.upload.dataSetID)

      const data = yield call(fetchDataSet, dataSetID)
      console.log(data)
      yield put({ type: 'setDataSet', payload: data.data})
      yield put(routerRedux.push('preview'))
    },


    * upload ({
                payload,
              }, { put, call, select }) {


      // const user = yield select(state => state['app'].user)
      console.log('enter upload model')
      console.log(payload)
      let formData = new FormData()
      let user_ID = 'dev_1'
      formData.append('uploaded_file', payload.upload.file)

      formData.append('description', payload.description)
      formData.append('if_private', true)
      formData.append('type', 'table')
      formData.append('data_set_name', payload.data_set_name)
      formData.append('user_ID', user_ID)
      payload.tags && formData.append('tags', payload.tags)

      payload.related_field && formData.append('related_field', payload.related_field)
      console.log('22')
      yield put({ type: 'setUploading', payload: true })

      const data = yield call(uploadFile, formData)
      console.log(data)
      message.success('upload success')
      yield put({ type: 'setUploading', payload: false })

      console.log('44')

      yield put({ type: 'setDataSetID', payload: data.data.data_set })
      console.log(data.data.data_set)
      yield put( {type: 'show'})


    },

  },

  reducers: {
    setUploading (state, { payload: uploading }) {
      return { ...state, uploading }
    },

    setDataSets(state, { payload: dataSets }) {
      return {
        ...state,
        dataSets,
      }
    },

    setDataSet(state, { payload: dataSet }) {
      return {
        ...state,
        dataSet,
      }
    },

    setDataSetID(state, { payload: dataSetID }) {
      return {
        ...state,
        dataSetID,
      }
    }

  },

}
