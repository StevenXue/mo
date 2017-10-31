import { uploadFile, fetchDataSets, fetchDataSet,
  deleteDataColumns, changeTypes, stateData,
  fetchStagingDataSet } from '../services/upload'

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
    stagingDataSet: [],
    dataSetName: '',
    dataSetDesc: '',
    dataSetTags: [],

    currentPage: 1,
    totalPages: 10,
    pageSize: 4,

    dataSetsLoading: false,
    viewLoading: false,
    addLoading: false,
    delLoading: false,
    saveLoading: false,
  },

  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname }) => {
        const match = pathToRegexp('/workspace/:projectId/import/select').exec(pathname);
        if (match) {
          dispatch({ type: 'fetch' })
        }
        const match2 = pathToRegexp('/workspace/:projectId/import/list').exec(pathname);
        if (match2) {
          dispatch({ type: 'staged' })
        }
      })
    },

  },


  effects: {

    * fetch(action, { call, put, select }) {
      yield put({type:'setDataSetsLoading', payload: true})
      // let user_ID = 'dev_1'

      const data = yield call(fetchDataSets)
      console.log(data)
      yield put({ type: 'setDataSets', payload: data.data })
      yield put({type:'setDataSetsLoading', payload: false})
    },

    * show(action, { call, put, select }) {
      yield put({type:'setViewLoading', payload: true})
      const dataSetID = yield select(state => state.upload.dataSetID)

      const data = yield call(fetchDataSet, dataSetID)
      // console.log(data)
      yield put({ type: 'setDataSet', payload: data.response})
      yield put({ type: 'setFields', payload: data.fields})
      yield put(routerRedux.push('preview'))
      yield put({type:'setViewLoading', payload: false})
      yield put({ type: 'setUploading', payload: false })
    },


    * upload ({
                payload,
              }, { put, call, select }) {

      // const user = yield select(state => state['app'].user)
      console.log('enter upload model')
      console.log(payload)
      let formData = new FormData()
      const user_ID = localStorage.getItem('user_ID')
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


      console.log('44')

      yield put({ type: 'setDataSetID', payload: data.data.data_set })
      console.log(data.data.data_set)
      yield put( {type: 'show'})
    },

    * delCol ({ payload }, { put, call, select }) {
      console.log('del', payload)
      // console.log(payload)
      yield put({type:'setDelLoading', payload: true})
      const dataSetID = yield select(state => state.upload.dataSetID)
      const res = yield call(deleteDataColumns, dataSetID, payload)
      console.log(res)

      // const dels = dels.concat(payload)

      yield put({type: 'addDeleted', payload: payload})
      // console.log(dels)

      yield put({type: 'setSelected', payload: []})
      yield put({type:'setDelLoading', payload: false})

    },

    * submit (action, { put, call, select }) {
      yield put({type:'setSaveLoading', payload: true})
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
      const res = yield call(changeTypes, dataSetID, fld_lst)

      yield put({type: 'stage'})
    },

    * stage (action, { put, call, select }) {
      // const test = yield select(state => state)
      // console.log(test)
      yield put({type:'setAddLoading', payload: true})
      const prjID = location.hash.split('/')[2]
      const dsname = yield select(state => state.upload.dataSetName)
      const dsdes = yield select(state => state.upload.dataSetDesc)
      const dataSetID = yield select(state => state.upload.dataSetID)
      const res = yield call(stateData, dataSetID, prjID, dsname, dsdes)
      console.log(res)
      yield put({type: 'staged'})
      yield put(routerRedux.push('list'))

    },

    * staged (action, { put, call, select }) {
      const prjID = location.hash.split('/')[2]
      const res = yield call(fetchStagingDataSet, prjID)
      // console.log(res.data)
      yield put({type: 'setStagingDataSet', payload: res.data})
      const sds = yield select(state => state.upload.stagingDataSet)
      console.log(sds)
      // yield put(routerRedux.push('list'))
      yield put({type:'setAddLoading', payload: false})
      yield put({type:'setSaveLoading', payload: false})
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

    setDataSetName(state, { payload: dataSetName }) {
      return {
        ...state,
        dataSetName,
      }
    },

    setDataSetDesc(state, { payload: dataSetDesc }) {
      return {
        ...state,
        dataSetDesc,
      }
    },

    setDataSetTags(state, { payload: dataSetTags }) {
      return {
        ...state,
        dataSetTags,
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
    },

    setStagingDataSet(state, { payload: stagingDataSet }) {
      return {
        ...state,
        stagingDataSet
      }
    },

    setCurrentPage(state, {payload: currentPage }) {
      return {
        ...state,
        currentPage
      }
    },

    setTotalPages(state, {payload: totalPages }) {
      return {
        ...state,
        totalPages
      }
    },

    setPageSize(state, {payload: pageSize}) {
      return {
        ...state,
        pageSize
      }
    },

    setDataSetsLoading(state, {payload: dataSetsLoading}) {
      return {
        ...state,
        dataSetsLoading
      }
    },

    setViewLoading(state, {payload: viewLoading}) {
      return {
        ...state,
        viewLoading
      }
    },

    setAddLoading(state, {payload: addLoading}) {
      return {
        ...state,
        addLoading
      }
    },

    setDelLoading(state, {payload: delLoading}) {
      return {
        ...state,
        delLoading
      }
    },

    setSaveLoading(state, {payload: saveLoading}) {
      return {
        ...state,
        saveLoading
      }
    },
  },

}
