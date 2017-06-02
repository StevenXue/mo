import { uploadFile, fetchFileList } from '../services/upload'
import { parse } from 'qs'
import { message } from 'antd'

export default {

  namespace: 'upload',

  state: {
    visible: false,
    files: {
      public_files: [],
      owned_files: []
    }
  },

  effects: {
    *fetch(
      {
        payload,
      }, { put, call, select }) {
      const user = yield select(state => state['app'].user);
      const data = yield call(fetchFileList, user.user_ID)
      if (data.success) {
        console.log('fetch success', data.response);
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
      formData.append('user_ID', user.user_ID);

      const data = yield call(uploadFile, formData)
      if (data.success) {
        console.log('upload success');
        message.success('上传成功')
        yield put({ type: 'hideModal' })

        // const from = queryURL('from')
        // yield put({ type: 'app/query' })
        // if (from) {
        //   yield put(routerRedux.push(from))
        // } else {
        //   yield put(routerRedux.push('/project'))
        // }
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

  },

}
