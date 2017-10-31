import modelExtend from 'dva-model-extend'
import pathToRegexp from 'path-to-regexp'

import workBench from './workBench'
import {JsonToArray} from '../utils/JsonUtils';

import { getRound } from '../utils/number'
import { get } from 'lodash'

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
              delete metrics[metric];
            }
          }

          sectionsJson[modelKey]['metrics_status'] = metrics;
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

