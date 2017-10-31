import modelExtend from 'dva-model-extend'
import pathToRegexp from 'path-to-regexp'

import workBench from './workBench'
import {getRound} from '../utils/number';

const categories = 'model';


const modelling = modelExtend(workBench, {
  namespace: 'modelling',
  state: {
  },
  reducers: {
    setModels(state, action) {
      let lengthModelsJson = Object.keys(action.payload.sectionsJson).length;

      if (lengthModelsJson !== 0) {
        for (let eachModel in action.payload.sectionsJson) {
          let metrics = {
            'acc': [],
            'precision': [],
            'recall': [],
            'loss': [],
            'val_acc': [],
            'val_precision': [],
            'val_recall': [],
            'val_loss': [],
          };
          for (let eachMetricHis of action.payload.sectionsJson[eachModel].metrics_status) {
            for (let metric of Object.keys(metrics)) {
              if (eachMetricHis[metric]) {
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

          action.payload.sectionsJson[eachModel]['metrics_status'] = metrics;
        }

        return {
          ...state,
          sectionsJson: action.payload.sectionsJson,
          focusModelId: Object.keys(action.payload.sectionsJson)[0]
        }
      }
      else {
        return {
          ...state,
          sectionsJson: action.payload.sectionsJson,
          focusModelId: null
        }
      }
    },
  },
  subscriptions: {
    // 当进入该页面是 获取用户所有 section
    setup({dispatch, history}) {
      return history.listen(({pathname}) => {
        const match = pathToRegexp('/workspace/:projectId/modelling').exec(pathname);
        if (match) {
          let projectId = match[1];

          dispatch({ type: 'fetchSections', projectId: projectId, categories })
          dispatch({ type: 'fetchAlgorithms', categories })
          // dispatch({ type: 'fetchStagingDatasetList', projectId: projectId })

          //将project id存起来
          dispatch({ type: 'setProjectId', payload: {projectId: projectId}});

        }
      });
    },

  },
})

export default modelling

