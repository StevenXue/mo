import { uploadFile, fetchDataSets, fetchDataSet, deleteDataColumns, changeTypes, stateData } from '../services/upload'

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
    fields: {},
    dataSetID: '',
    selected: [],
    deleted: [],

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
      // console.log(data)
      yield put({ type: 'setDataSets', payload: data.data })

    },

    * show(action, { call, put, select }) {
      const dataSetID = yield select(state => state.upload.dataSetID)

      const data = yield call(fetchDataSet, dataSetID)
      // console.log(data)
      yield put({ type: 'setDataSet', payload: data.response})
      yield put({ type: 'setFields', payload: data.fields})
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

    * delCol ({ payload }, { put, call, select }) {
      console.log('del', payload)
      // console.log(payload)
      const dataSetID = yield select(state => state.upload.dataSetID)
      const res = yield call(deleteDataColumns, dataSetID, payload)
      console.log(res)

      // const dels = dels.concat(payload)

      yield put({type: 'addDeleted', payload: payload})
      // console.log(dels)

      yield put({type: 'setSelected', payload: []})


    },

    * submit (action, { put, call, select }) {
      const flds = yield select(state => state.upload.fields)
      const dels = yield select(state => state.upload.deleted)
      const dataSetID = yield select(state => state.upload.dataSetID)
      const fld_lst = []
      const ignored = ['data_set', '_id', 'staging_dataset_id'].concat(dels)
      for (let key of Object.keys(flds)) {
        if (!ignored.includes(key)) {

          if (flds[key] === 'string') {
            fld_lst.push([key, 'str'])
          }
          else if (flds[key] === 'integer') {
            fld_lst.push([key, 'int'])
          }
          else {
            fld_lst.push([key, 'float'])
          }

        }
      }
      // const res = yield call(changeTypes, dataSetID, fld_lst)

      yield put({type: 'stage'})
    },

    * stage (action, { put, call, select }) {
      // const test = yield select(state => state)
      // console.log(test)
      const prjID = yield select(state => state.projectDetail.project._id)
      const prjname = yield select(state => state.projectDetail.project.name)
      const prjdes = yield select(state => state.projectDetail.project.description)
      const dataSetID = yield select(state => state.upload.dataSetID)
      const res = yield call(stateData, dataSetID, prjID, prjname, prjdes)
      console.log(res)
    }


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

    setFields(state, { payload: flds }) {
      for (let key of Object.keys(flds)) {
        flds[key] = flds[key][0]
      }
      return {
        ...state,
        fields: flds
      }
    },

    setField(state, { payload: value }) {
      const fields = {...state.fields, ...value}
      return {
        ...state,
        fields,
      }
    },

    setDataSetID(state, { payload: dataSetID }) {
      return {
        ...state,
        dataSetID,
      }
    },


    setSelected(state, { payload: selected }) {
      return {
        ...state,
        selected,
      }
    },

    addDeleted(state, { payload: dels }) {
      return {
        ...state,
        deleted: state.deleted.concat(dels),
      }
    }

  },

}
