import modelExtend from 'dva-model-extend'
import pathToRegexp from 'path-to-regexp'
import { get, isEqual } from 'lodash'
import * as dataAnalysisService from '../services/dataAnalysis'

import workBench from './workBench'

import { getRound } from '../utils/number'

const categories = 'model'

const modelling = modelExtend(workBench, {
  namespace: 'modelling',
  state: {},
  reducers: {
    setModels(state, action) {
      let lengthModelsJson = Object.keys(action.payload.sectionsJson).length
      let { payload: { sectionsJson } } = action
      if (lengthModelsJson > 0) {
        for (let modelKey in sectionsJson) {
          let metrics = {
            'acc': [],
            'precision': [],
            'recall': [],
            'loss': [],
            'val_acc': [],
            'val_precision': [],
            'val_recall': [],
            'val_loss': [],
          }
          for (let eachMetricHis of Object.values(get(sectionsJson[modelKey], 'metrics_status', {}))) {
            for (let metric of Object.keys(metrics)) {
              if (eachMetricHis[metric] !== undefined) {
                metrics[metric].push(getRound(eachMetricHis[metric], 2))
              }
            }
          }
          // 剔除空的metrics
          for (let metric of Object.keys(metrics)) {
            if (metrics[metric].length === 0) {
              delete metrics[metric]
            }
          }

          sectionsJson[modelKey]['metrics_status'] = metrics
        }




        return {
          ...state,
          sectionsJson: sectionsJson,
          focusModelId: Object.keys(action.payload.sectionsJson)[0],
        }
      }
      else {
        return {
          ...state,
          sectionsJson: sectionsJson,
          focusModelId: null,
        }
      }
    },
    setMetrics(state, { payload }) {
      const { msg } = payload
      const sectionId = msg.job_id
      let sectionsJson = state.sectionsJson
      console.log('message', msg)

      let metrics = {
        'acc': [],
        'precision': [],
        'recall': [],
        'loss': [],
        'val_acc': [],
        'val_precision': [],
        'val_recall': [],
        'val_loss': [],
      }

      // if(sectionsJson[sectionId].messages && sectionsJson[sectionId].messages.find(e => isEqual(e, msg))) {
      //   console.log('message')
      //   return {
      //     ...state,
      //     sectionsJson,
      //   }
      // }

      if (sectionsJson[sectionId].metrics_status) {
        for (let metric in metrics) {
          if (msg[metric] !== undefined) {
            if (!sectionsJson[sectionId].metrics_status[metric]) {
              sectionsJson[sectionId].metrics_status[metric] = [msg[metric]]
            } else {
              sectionsJson[sectionId].metrics_status[metric].push(msg[metric])
            }
          }
        }
      } else {
        for (let metric in metrics) {
          if (msg[metric] !== undefined) {
            metric[metric].push(msg[metric])
          }
        }

        for (let metric of Object.keys(metrics)) {
          if (metrics[metric].length === 0) {
            delete metrics[metric]
          }
        }
        sectionsJson[sectionId].metrics_status = metrics
      }

      // receive batch
      if(msg.batch) {
        sectionsJson[sectionId].batch = msg.batch
      }

      // // record messages and prevent duplicate
      // if(msg) {
      //   if(!sectionsJson[sectionId].messages) {
      //     sectionsJson[sectionId].messages= [msg]
      //   } else {
      //     sectionsJson[sectionId].messages.push(msg)
      //   }
      // }
      console.log('sectionsJson', sectionsJson)
      return {
        ...state,
        sectionsJson,
      }
    },
    clearMetrics(state, { payload }) {
      let sectionsJson = state.sectionsJson
      sectionsJson[payload.sectionId].metrics_status = {}
      sectionsJson[payload.sectionId].batch = undefined
      return {
        ...state,
        sectionsJson,
      }
    },
  },
  effects: {
    *runSection(action, { call, put, select }) {
      const { namespace, sectionId } = action.payload
      yield put({ type: 'clearMetrics', payload: { sectionId } })
      yield put({ type: 'showResult' })
      yield put({
        type: 'setLoading', payload: {
          key: 'wholePage',
          loading: true,
        },
      })
      yield put({
        type: 'setStatus', payload: {
          sectionId,
          status: 100,
        },
      })

      // 先把 save section 复制过来
      const sectionsJson = yield select(state => state[namespace].sectionsJson)
      const section = sectionsJson[sectionId]
      yield call(dataAnalysisService.saveSection, { section: section })

      const projectId = yield select(state => state[namespace].projectId)

      const { data: { result: { result } } } = yield call(dataAnalysisService.runJob, {
        ...action.payload,
        projectId: projectId,
      })

      // 更新result
      yield put({
        type: 'setSectionResult', payload: {
          sectionId,
          result,
        },
      })
      yield put({
        type: 'setLoading', payload: {
          key: 'wholePage',
          loading: false,
        },
      })
    },
  },
  subscriptions: {
    // 当进入该页面是 获取用户所有 section
    setup({ dispatch, history }) {
      return history.listen(({ pathname }) => {
        const match = pathToRegexp('/workspace/:projectId/modelling').exec(pathname)
        if (match) {
          let projectId = match[1]

          dispatch({ type: 'fetchSections', projectId: projectId, categories })
          dispatch({ type: 'fetchAlgorithms', categories })
          // dispatch({ type: 'fetchStagingDatasetList', projectId: projectId })

          //将project id存起来
          dispatch({ type: 'setProjectId', payload: { projectId: projectId } })
        }
      })
    },

  },
})

export default modelling

