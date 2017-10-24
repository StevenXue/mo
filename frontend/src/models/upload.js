import { uploadFile } from '../services/upload'
import { parse } from 'qs'
import lodash from 'lodash'
import { message } from 'antd'

export default {
  namespace: 'upload',

  state: {
    uploading: false

  },

  subscriptions: {

  },

  effects: {

    * upload ({
                payload,
              }, { put, call, select }) {


      // const user = yield select(state => state['app'].user)
      console.log('enter upload model')
      console.log(payload)
      let formData = new FormData()
      formData.append('uploaded_file', payload.upload.file)

      formData.append('description', payload.description)
      formData.append('if_private', false)
      formData.append('type', 'table')
      formData.append('data_set_name', payload.data_set_name)
      formData.append('user_ID', 'user_0607')
      payload.tags && formData.append('tags', payload.tags)

      payload.related_field && formData.append('related_field', payload.related_field)
      console.log('22')
      yield put({ type: 'setUploading', payload: true })
      console.log('225')
      const data = yield call(uploadFile, formData)
      console.log('33')
      if (data.success) {
        console.log('upload success')
        message.success('upload success')
        yield put({ type: 'setUploading', payload: false })

        // yield put({ type: 'fetch' })

      } else {
        console.log('error', data, formData)
        throw data
      }
    },

  },

  reducers: {
    setUploading (state, { payload: uploading }) {
      return { ...state, uploading }
    },

  },

}
