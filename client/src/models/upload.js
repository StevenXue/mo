import { uploadFile, fetchFileList, importData } from '../services/upload'
import { parse } from 'qs'
import lodash from 'lodash'
import { message } from 'antd'

export default {

  namespace: 'upload',

  state: {
    visible: false,
    panelVisible: false,
    files: {
      public_files: [],
      owned_files: []
    },
    button: -1,
  },

  effects: {
    *fetch(
      {
        payload,
      }, { put, call, select }) {
      const user = yield select(state => state['app'].user);
      const data = yield call(fetchFileList, user.user_ID)
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
      formData.append('user_ID', user.user_ID);

      const data = yield call(uploadFile, formData)
      if (data.success) {
        console.log('upload success');
        message.success('upload success')
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
        message.success('Import Success!')
      } else {
        console.log('error', data);
        throw data
      }
    },
  },
  reducers: {

    querySuccess (state, { payload: files }) {
      // const {} = action.payload
      return {
        ...state,
        files,
        // list,
        // pagination: {
        //   ...state.pagination,
        //   ...pagination,
        // }
      }
    },

    showModal (state, action) {
      return { ...state, ...action.payload, visible: true }
    },

    hideModal (state) {
      return { ...state, visible: false }
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
