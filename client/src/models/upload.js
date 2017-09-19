import { uploadFile, fetchFileList, fetchDataSets, importData } from '../services/upload'
import { parse } from 'qs'
import lodash from 'lodash'
import { message } from 'antd'

export default {
  namespace: 'upload',

  state: {
    uploading: false,
    visible: false,
    panelVisible: false,
    files: {
      public_files: [],
      owned_files: []
    },
    dataSets: {
      public_ds: [],
      owned_ds: []
    },
    button: -1,
    field: '',
    tags: [],
    relatedTasks: '',
    inputVisible: false,
    inputValue: ''
  },

  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(({ pathname }) => {
        if (pathname === '/upload') {
          dispatch({
            type: 'fetch',
          });
        }
      });
    },
  },

  effects: {
    *fetch(
      {
        payload,
      }, { put, call, select }) {
      const user = yield select(state => state['app'].user);
      const data = yield call(fetchDataSets, user.user_ID)
      if (data.success) {
        yield put({ type: 'querySuccess', payload: data.response })
      } else {
        console.log('error', data);
        throw data
      }
    },
    *upload(
      {
        payload,
      }, { put, call, select }) {

      const user = yield select(state => state['app'].user);

      let formData = new FormData();
      formData.append('uploaded_file', payload.upload[0]);
      formData.append('description', payload.description);
      formData.append('if_private', payload.isPrivate);
      formData.append('type', payload.type);
      formData.append('data_set_name', payload.data_set_name);
      payload.tags && formData.append('tags', payload.tags);
      payload.related_tasks && formData.append('related_tasks', payload.related_tasks);
      payload.related_field && formData.append('related_field', payload.related_field);
      formData.append('user_ID', user.user_ID);
      yield put({ type: 'setUploading', payload: true })
      const data = yield call(uploadFile, formData)
      if (data.success) {
        console.log('upload success');
        message.success('upload success')
        yield put({ type: 'setUploading', payload: false })
        yield put({ type: 'hideModal' })

        // const from = queryURL('from')
        yield put({ type: 'fetch' })
        // if (from) {
        //   yield put(routerRedux.push(from))
        // } else {
        //   yield put(routerRedux.push('/project'))
        // }
      } else {
        console.log('error', data, formData);
        throw data
      }
    },

    *importData(
      {
        payload,
      }, { put, call, select }) {
      const user = yield select(state => state['app'].user);
      const file = yield select(state => state['upload'].file);
      let body = lodash.cloneDeep(payload)
      body['user_ID'] = user.user_ID
      body['file_id'] = file._id
      if (body['names']) {
        body['names'] = body.names
          .replace(/ /g, '')
          .replace(/"/g, '')
          .replace(/'/g, '')
          .split(',')
      }
      const data = yield call(importData, body)
      if (data.success) {
        yield put({type: 'resetStates'})
        message.success('Import Success!')
      } else {
        console.log('error', data);
        throw data
      }
    },
  },


  reducers: {

    querySuccess (state, { payload: dataSets }) {
      // const {} = action.payload
      return {
        ...state,
        dataSets,
        // list,
        // pagination: {
        //   ...state.pagination,
        //   ...pagination,
        // }
      }
    },

    resetStates(state) {
      return { ...state, inputValue: '', tags:[], inputVisible: false }
    },

    setUploading (state, {payload: uploading}) {
      return { ...state, uploading }
    },

    showModal (state, action) {
      return { ...state, ...action.payload, visible: true }
    },

    hideModal (state) {
      return { ...state, visible: false }
    },

    showInput(state) {
      console.log("inputVisible");
      return { ...state, inputVisible: true }
    },

    hideInput(state) {
      return { ...state, inputVisible: false }
    },

    removeTag(state, {payload: value}){
      return {...state, tags: value}
    },

    setInputValue(state, {payload: value}){
      return {...state, inputValue: value }
    },

    confirmInput(state){
      //let tags = state.tags;
      let value = state.inputValue;
      return {...state, inputValue: '',  inputVisible: false, tags: [...state.tags, value]}
    },

    toggleButton (state, {payload: button}) {
      return {
        ...state,
        button,
      }
    },

    showImportPanel (state, { payload: file }) {
      return {
        ...state,
        panelVisible: true,
        file,
      }
    },

    hideImportPanel (state) {
      return {
        ...state,
        panelVisible: false,
      }
    },
  },

}
