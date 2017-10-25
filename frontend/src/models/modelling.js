import modelExtend from 'dva-model-extend'
import pathToRegexp from 'path-to-regexp'

import workBench from './workBench'
const categories = 'model';

const modelling = modelExtend(workBench, {
  namespace: 'modelling',
  subscriptions: {
    // 当进入该页面是 获取用户所有 section
    setup({dispatch, history}) {
      return history.listen(({pathname}) => {
        const match = pathToRegexp('/projects/:projectId/modelling').exec(pathname);
        if (match) {
          let projectId = match[1];

          dispatch({ type: 'fetchSections', projectId: projectId, categories })
          dispatch({ type: 'fetchAlgorithms', categories })
          dispatch({ type: 'fetchStagingDatasetList' })
        }
      });
    },

  },
})

export default modelling
