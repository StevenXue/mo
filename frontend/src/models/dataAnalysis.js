import pathToRegexp from 'path-to-regexp';
import modelExtend from 'dva-model-extend';
import workBench from './workBench';

import  * as stagingDataService from '../services/stagingData';
import  * as jobService from '../services/job';

const categories = 'toolkit';

const dataAnalysis = modelExtend(workBench, {
  namespace: 'dataAnalysis',
  state: {
  },
  reducers: {

  },
  effects: {

    *saveResult(action, { call, put, select }) {
      const { id } = action.payload;

      const { data } = yield call(jobService.save_result, {
        id
      });

    },


    *saveAsResult(action, { call, put, select }) {
      const { id, newSdsName } = action.payload;
      console.log("id,name", id, newSdsName )
      const { data } = yield call(jobService.save_as_result, {
        id,
        newSdsName
      });

      const projectId = yield select(state => state.dataAnalysis.projectId);
      //保存完更新staging data sets
      yield put({ type: 'preview/fetchStagingDatasetList', payload: { projectId: projectId } })
    }

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
