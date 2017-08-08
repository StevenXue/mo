import lodash from 'lodash'
import { parse } from 'qs'
import { message } from 'antd'
import { Router, routerRedux } from 'dva/router'
import * as KerasJS from 'keras-js'
import range from 'lodash/range'


const MODEL_CONFIG = {
  model: 'https://transcranial.github.io/keras-js-demos-data/mnist_cnn/mnist_cnn.json',
  weights: 'https://transcranial.github.io/keras-js-demos-data/mnist_cnn/mnist_cnn_weights.buf',
  metadata: 'https://transcranial.github.io/keras-js-demos-data/mnist_cnn/mnist_cnn_metadata.json'
}

const LAYER_DISPLAY_CONFIG = {
  conv2d_1: { heading: '32 3x3 filters, padding valid, 1x1 strides', scalingFactor: 2 },
  activation_1: { heading: 'ReLU', scalingFactor: 2 },
  conv2d_2: { heading: '32 3x3 filters, padding valid, 1x1 strides', scalingFactor: 2 },
  activation_2: { heading: 'ReLU', scalingFactor: 2 },
  max_pooling2d_1: { heading: '2x2 pooling, 1x1 strides', scalingFactor: 2 },
  dropout_1: { heading: 'p=0.25 (only active during training phase)', scalingFactor: 2 },
  flatten_1: { heading: '', scalingFactor: 2 },
  dense_1: { heading: 'output dimensions 128', scalingFactor: 4 },
  activation_3: { heading: 'ReLU', scalingFactor: 4 },
  dropout_2: { heading: 'p=0.5 (only active during training phase)', scalingFactor: 4 },
  dense_2: { heading: 'output dimensions 10', scalingFactor: 8 },
  activation_4: { heading: 'Softmax', scalingFactor: 8 }
}

export default {

  namespace: 'predict',

  state: {
    model: new KerasJS.Model(Object.assign({ gpu: false }, {filepaths: MODEL_CONFIG})), // eslint-disable-line
    modelLoading: true,
    input: new Float32Array(784),
    output: new Float32Array(10),
    outputClasses: range(10),
    layerResultImages: [],
    layerDisplayConfig: LAYER_DISPLAY_CONFIG,
    drawing: false,
    strokes: []
  },

  effects: {
    *query ({ payload }, { call, put, select }) {
      const user = yield select(state => state['app'].user)
      yield put({
        type: 'querySuccess',
        payload: {
          user: user,
        }
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


  },

  reducers: {

    querySuccess (state, action) {
      return { ...state, ...action.payload }
    },

    setlayerResultImages (state, { payload: layerResultImages }) {
      return { ...state, layerResultImages }
    },

    setStrokes (state, { payload: strokes }) {
      return { ...state, strokes }
    },

    setInput (state, { payload: input }) {
      return { ...state, input }
    },

    setOutput (state, { payload: output }) {
      return { ...state, output }
    },

    endLoading (state) {
      return { ...state, modelLoading: false }
    },

    startDrawing (state) {
      return { ...state, drawing: true }
    },

    endDrawing (state) {
      return { ...state, drawing: false }
    },

  },

}
