import pathToRegexp from 'path-to-regexp';
import * as dataAnalysisService from '../services/dataAnalysis'
const dict = {
  'analysis': 'toolkit',
  'modelling': 'model'
};

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

    setProjectId(state, action) {
      return {
        ...state,
        category: action.payload.category,
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
      const {projectId, category} = action.payload;


      let {data: {[category]: historyList}} = yield call(dataAnalysisService.fetchSections, {
        projectId: projectId,
        categories: category
      });

      // temp sort history
      historyList = historyList.sort(function (a, b) {
        return new Date(b.create_time) - new Date(a.create_time);
      });

      yield put({type: 'setHistory', payload: {historyList}})

    },
  },

  subscriptions: {
    setup({dispatch, history}) {
      return history.listen(({pathname}) => {
        const match = pathToRegexp('/workspace/:projectId/:category').exec(pathname);
        if (match) {
          let projectId = match[1];
          let category = match[2];

          if (['analysis', 'modelling'].includes(category)) {
            //将project id存起来
            dispatch({type: 'setProjectId', payload: {projectId: projectId}});
            dispatch({type: 'setCategory', payload: {category: dict[category]}});

            dispatch({type: 'fetchHistory', payload: {projectId: projectId, category: dict[category]}});
          }

        }
      });
    },
  }

}
