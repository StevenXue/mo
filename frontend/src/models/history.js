import pathToRegexp from 'path-to-regexp';
import * as dataAnalysisService from '../services/dataAnalysis'

export default {
  namespace: 'history',
  state: {
    historyList: []

  },
  reducers: {
    setProjectId(state, action) {
      return {
        ...state,
        projectId: action.payload.projectId,
      }
    },

    setHistory(state, action) {
      return {
        ...state,
        historyList: action.payload.historyList,
      }
    },



  },
  effects: {
    // 获取stage data set list
    * fetchHistory(action, {call, put, select}) {
      const projectId = action.payload.projectId;
      const dict = {
        'analysis': 'toolkit',
        'modelling': 'model'
      };
      const {data: {toolkit: historyList}} = yield call(dataAnalysisService.fetchSections, {
        projectId: projectId,
        categories: dict[action.payload.category]
      });

      yield put({type: 'setHistory', payload: {historyList}})

    },
  },

  subscriptions: {
    setup({dispatch, history}) {
      return history.listen(({pathname}) => {
        const match = pathToRegexp('/projects/:projectId/:category').exec(pathname);
        if (match) {
          let projectId = match[1];
          let category = match[2];

          //将project id存起来
          dispatch({type: 'setProjectId', payload: {projectId: projectId}});
          dispatch({type: 'fetchHistory', payload: {projectId: projectId, category: category}});

        }
      });
    },
  }

}
