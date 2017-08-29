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
  listToolkits,
  getNotebookFile,
  getNotebookContent,
  unpublishProject,
  deploy
} from '../services/project'
import { isEmpty } from '../utils/utils'

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
    activeKeys: [],
    isPublic: false,
    notebookContent: {}
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
      yield put({type: 'setDeletingProject', payload: undefined})
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

    * deployModel ({ payload }, { call, put, select }) {
      const user = yield select(state => state['app'].user)
      yield put({
        type: 'querySuccess',
        payload: {
          user: user,
        },
      })
      let args = {
        "user_ID": user.user_ID,
        "name": payload.name,
        "description": payload.des,
        "signatures": {"inputs": "inputs", "outputs": "scores",
          "def": "predict"},
        "input_type": "1darray"
      }
      const data = yield call(deploy, payload._id, args)
      if (data.success) {
        message.success("Model deployed, please check it at the Deployed Model Section")
      } else {
        console.log('error', data)
        throw data
      }
    },

    *getNotebook ({ payload }, { call, put, select }) {
      const user = yield select(state => state['app'].user)
      const data = yield call(getNotebookFile, user.user_ID, payload)
      if(data.success){
        console.log("notebook success", data);
        let notebook_content = {}
        if(data.content instanceof Array && data.content[0]) {
          let content = data.content;
          notebook_content = content.find((el) => el.type === 'notebook')
        }

        if (isEmpty(notebook_content)){
          yield put({
            type: 'querySuccess',
            payload: {
              notebookContent: {},
            },
          })
        }else{
          yield put({
            type: 'getNotebookContent',
            payload: {
              path: notebook_content.path
            }
          })
        }
      }else{
        console.log('error', data)
        throw data
      }
    },

    *getNotebookContent({ payload }, { call, put, select }) {
      const data = yield call(getNotebookContent, payload.path)
      if(data.success){
        console.log("content success", data)
        yield put({
          type: 'querySuccess',
          payload: {
            notebookContent: data.content,
          },
        })
      }else{
        console.log('error', res)
        throw res
      }
    },

    * toDetail ({ payload }, { call, put, select }) {
      const user = yield select(state => state['app'].user)
      yield put({type: 'setProjectPrivacy', payload: payload.isPublic})
      yield put(
        routerRedux.push({
          pathname: `project/${payload.name}`,
          query: {
            _id: payload._id,
            user: user,
            isPublic: payload.isPublic
          },
        }),
      )
    },

    * fork ({ payload }, { call, put, select }) {
      const user = yield select(state => state['app'].user)
      console.log('fork', payload, user.user_ID)
      yield put({ type: 'setForkingProject', payload: payload})
      const data = yield call(forkProject, payload, user.user_ID)
      if (data.success) {
        message.success('fork success!')
        const res = yield call(query, user.user_ID)
        yield put({ type: 'setForkingProject', payload: undefined})
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
        yield put({ type: 'setForkingProject', payload: undefined})
        console.log('error', data)
        throw data
      }
    },

    * publish ({ payload }, { call, put, select }) {
      console.log('to detail', payload)
      yield put({ type: 'setPublishingProject', payload: payload})
      const data = yield call(publishProject, payload)
      const user = yield select(state => state['app'].user)
      if (data.success) {
        message.success('publish success!')
        const res = yield call(query, user.user_ID)
        yield put({ type: 'setPublishingProject', payload: undefined})
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
        yield put({ type: 'setPublishingProject', payload: undefined})
        console.log('error', data)
        throw data
      }
    },

    * unpublish ({ payload }, { call, put, select }) {
      console.log('to detail', payload)
      yield put({ type: 'setPublishingProject', payload: payload})
      const data = yield call(unpublishProject, payload)
      const user = yield select(state => state['app'].user)
      if (data.success) {
        message.success('unpublish success!')
        const res = yield call(query, user.user_ID)
        yield put({ type: 'setPublishingProject', payload: undefined})
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
        yield put({ type: 'setPublishingProject', payload: undefined})
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

    setProjectPrivacy (state, action) {
      return { ...state, isPublic: action.payload }
    },

    selectDataSets (state, action) {
      return { ...state, ...action.payload }
    },

    setActiveKey (state, { payload: activeKey }) {
      // console.log("in model", activeKeys);
      let activeKeys = activeKey.filter((elem, index, self) => index === self.indexOf(elem))
      return {
        ...state,
        activeKeys,
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

    setDeletingProject (state, {payload: deletingProject}) {
      return {
        ...state,
        deletingProject,
      }
    },

    setForkingProject (state, {payload: forkingProject}) {
      return {
        ...state,
        forkingProject,
      }
    },

    setPublishingProject (state, {payload: publishingProject}) {
      return {
        ...state,
        publishingProject,
      }
    },

  },

}
