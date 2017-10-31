import pathToRegexp from 'path-to-regexp';
import modelExtend from 'dva-model-extend';
import workBench from './workBench';

const categories = 'toolkit';

const dataAnalysis = modelExtend(workBench, {
  namespace: 'dataAnalysis',
  state: {
  },
  reducers: {

  },
  effects: {

  },

  subscriptions: {
    // 当进入该页面是 获取用户所有 section
    setup({dispatch, history}) {
      return history.listen(({pathname}) => {
        const match = pathToRegexp('/workspace/:projectId/analysis').exec(pathname);
        if (match) {
          let projectId = match[1];

          dispatch({ type: 'fetchSections', projectId: projectId, categories });

          dispatch({ type: 'fetchAlgorithms', categories });
          // dispatch({ type: 'fetchStagingDatasetList', projectId: projectId });

          //将project id存起来
          dispatch({ type: 'setProjectId', payload: {projectId: projectId}});

        }
      });
    },
  },
});
export default dataAnalysis;
