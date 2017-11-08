import { uploadFile, fetchDataSets, fetchDataSet,
  deleteDataColumns, changeTypes, stageData,
  fetchStagingDataSets, updateStagingDataSet,
  getStagingDataSet, changeStagedTypes,
  deleteStagedDataColumns } from '../services/upload'

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
    orgFields: {},
    fields: {},
    dataSetID: '',
    selected: [],
    deleted: [],
    stagingDataSet: [],
    dataSetName: '',
    dataSetDesc: '',
    dataSetTags: [],

    sdsNames: [],

    currentPage: 1,
    totalPages: 10,
    pageSize: 4,

    showStaged: false,

    dataSetsLoading: false,
    viewLoading: false,
    addLoading: false,
    delLoading: false,
    saveLoading: false,
    saveAddLoading: false,

    firstLoading: false,
    lastLoading: false,

    stagedLoading: false,
  },

  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname }) => {
        const match = pathToRegexp('/workspace/:projectId/import/select').exec(pathname);
        if (match) {
          dispatch({ type: 'fetch' })
        }
        const match2 = pathToRegexp('/workspace/:projectId/import').exec(pathname);
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

      const data = yield call(fetchDataSet, dataSetID, false)
      // console.log(data)
      const flds = {}
      for (const v of Object.keys(data.fields)) {
        flds[v] = data.fields[v][0]
      }
      const orgflds = JSON.parse(JSON.stringify(flds))
      console.log(orgflds)
      yield put({ type: 'setDataSet', payload: data.response})
      yield put({ type: 'setOrgFields', payload: orgflds})
      yield put({ type: 'setFields', payload: flds})
      yield put({ type: 'setShowStaged', payload: false})
      yield put(routerRedux.push('preview'))
      yield put({type:'setViewLoading', payload: false})
      yield put({ type: 'setUploading', payload: false })
    },

    * showStaged(action, { call, put, select }) {
      yield put({ type: 'setShowStaged', payload: true})
      yield put({ type: 'setStagedLoading', payload: true})
      const url0 = location.hash.substr(1)
      yield put(routerRedux.replace(url0+'/preview'))

      const sdsid = yield select(state => state.upload.dataSetID)
      const {data} = yield call(getStagingDataSet, sdsid, 1)
      // console.log(data)
      const flds = {}
      for (const v of data.columns) {
        flds[v[0]] = v[1][0]
      }
      console.log(flds)
      const orgflds = JSON.parse(JSON.stringify(flds))
      yield put({ type: 'setDataSet', payload: data.data})
      yield put({ type: 'setOrgFields', payload: orgflds})
      yield put({ type: 'setFields', payload: flds})
      yield put({ type: 'setStagedLoading', payload: false})
    },

    * showInTable({payload}, { call, put, select }) {
      const {page, type} = payload
      if (page === -1) {
        yield put({type:'setLastLoading', payload: true})
      } else {
        yield put({type: 'setFirstLoading', payload: true})
      }
      const dataSetID = yield select(state => state.upload.dataSetID)

      if (type === 'ds') {
        const data = yield call(fetchDataSet, dataSetID, page)
        yield put({ type: 'setDataSet', payload: data.response})
      } else {
        const {data} = yield call(getStagingDataSet, dataSetID, page)
        yield put({ type: 'setDataSet', payload: data.data})
      }

      if (page === -1) {
        yield put({type:'setLastLoading', payload: false})
      } else {
        yield put({type: 'setFirstLoading', payload: false})
      }
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
      yield put({type: 'setDataSetName', payload: payload.data_set_name })
      yield put({type: 'setDataSetDesc', payload: payload.description})
      yield put( {type: 'show'})
    },

    * delCol ({ payload }, { put, call, select }) {
      console.log('del', payload)
      // console.log(payload)
      yield put({type:'setDelLoading', payload: true})
      const dataSetID = yield select(state => state.upload.dataSetID)
      const res = yield call(deleteStagedDataColumns, dataSetID, payload)
      console.log(res)
      yield put({type: 'addDeleted', payload: payload})
      // console.log(dels)
      yield put({type: 'setSelected', payload: []})
      yield put({type:'setDelLoading', payload: false})
    },

    * submit ({payload}, { put, call, select }) {
      if (payload === 'new') {
        yield put({type:'setSaveAddLoading', payload: true})
      } else {
        yield put({type:'setSaveLoading', payload: true})
      }

      const flds = yield select(state => state.upload.fields)
      const org_flds = yield select(state => state.upload.orgFields)
      const dels = yield select(state => state.upload.deleted)
      const dataSetID = yield select(state => state.upload.dataSetID)
      const fld_lst = []
      let change_flag = false
      const ignored = ['data_set', '_id', 'staging_dataset_id'].concat(dels)
      for (let key of Object.keys(flds)) {
        if (!ignored.includes(key)) {

          if (flds[key] !== org_flds[key]) {
            change_flag = true
          }
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
      if (change_flag) {
        console.log('change')
        yield call(changeTypes, dataSetID, fld_lst)
      } else {
        console.log('not change')
      }

      yield put({type: 'stage', payload: payload})
    },

    * submitStaged (action, { put, call, select }) {
      yield put({type:'setSaveLoading', payload: true})
      const flds = yield select(state => state.upload.fields)
      const org_flds = yield select(state => state.upload.orgFields)
      const dels = yield select(state => state.upload.deleted)
      const dataSetID = yield select(state => state.upload.dataSetID)
      const fld_lst = []
      let change_flag = false
      const ignored = ['_id', 'staging_data_set'].concat(dels)
      for (let key of Object.keys(flds)) {
        if (!ignored.includes(key)) {

          if (flds[key] !== org_flds[key]) {
            change_flag = true
          }
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
      if (change_flag) {
        console.log('change')
        yield call(changeStagedTypes, dataSetID, fld_lst)
      } else {
        console.log('not change')
      }
      const url0 = location.hash.substr(1).replace('/preview', '')
      yield put(routerRedux.replace(url0))
      yield put({type:'setSaveLoading', payload: false})
    },

    * stage ({payload}, { put, call, select }) {
      // const test = yield select(state => state)
      // console.log(test)
      yield put({type:'setAddLoading', payload: true})
      const prjID = location.hash.split('/')[2]
      const dsname = yield select(state => state.upload.dataSetName)
      const dsdes = yield select(state => state.upload.dataSetDesc)
      const dataSetID = yield select(state => state.upload.dataSetID)
      const res = yield call(stageData, dataSetID, prjID, dsname, dsdes)
      console.log(res)
      if (payload !== 'new') {
        yield put({type: 'staged'})
        const url0 = location.hash.substr(1).replace('preview', '')
        const url1 = url0.replace('select', '')
        // console.log('url0', url0)
        yield put(routerRedux.replace(url1))

      } else {
        const url1 = location.hash.substr(1).replace('preview', 'choice')
        yield put(routerRedux.replace(url1))
        yield put({type:'setSaveAddLoading', payload: false})
        yield put({type:'setAddLoading', payload: false})
      }


    },

    * staged (action, { put, call, select }) {
      const prjID = location.hash.split('/')[2]
      const res = yield call(fetchStagingDataSets, prjID)
      const url0 = location.hash.substr(1).replace('list', '')
      console.log(location.hash.split('/')[3])

      if (res.data.length === 0) {
        yield put(routerRedux.push('import/choice'))
      } else {
        yield put({type: 'setStagingDataSet', payload: res.data})
        console.log(res.data)
        const sdsnames = res.data.map((e) => (e.name))
        yield put({type: 'setsdsNames', payload: sdsnames})
        // console.log(sdsnames)
        // yield put(routerRedux.push('list'))
        yield put({type:'setAddLoading', payload: false})
        yield put({type:'setSaveLoading', payload: false})
      }

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

    setFields(state, { payload: fields }) {
      return {
        ...state,
        fields
      }
    },

    setOrgFields(state, { payload: orgFields }) {
      return {
        ...state,
        orgFields
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

    setSaveAddLoading(state, {payload: saveAddLoading}) {
      return {
        ...state,
        saveAddLoading
      }
    },

    setsdsNames(state, {payload: sdsNames}) {
      return {
        ...state,
        sdsNames
      }
    },

    setShowStaged(state, {payload: showStaged}) {
      return {
        ...state,
        showStaged
      }
    },

    setFirstLoading(state, {payload: firstLoading}) {
      return {
        ...state,
        firstLoading
      }
    },

    setLastLoading(state, {payload: lastLoading}) {
      return {
        ...state,
        lastLoading
      }
    },

    setStagedLoading(state, {payload: stagedLoading}) {
      return {
        ...state,
        stagedLoading
      }
    },
  },

}
