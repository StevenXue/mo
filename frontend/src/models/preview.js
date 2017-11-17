import pathToRegexp from 'path-to-regexp';
import * as stagingDataService from '../services/stagingData'

export default {
  namespace: 'preview',
  state: {
    stagingDataList: [],
    table: [],
    projectId: '',
    spinLoading: {
      fetchTable: false,
    },

  },
  reducers: {
    setProjectId(state, action) {
      return {
        ...state,
        projectId: action.payload.projectId,
      }
    },

    // 更改 stagingDataList
    setStagingDataList(state, action) {
      return {
        ...state,
        stagingDataList: action.payload.stagingDataList,
      }
    },

    setTable(state, action) {
      return {
        ...state,
        table: action.payload.table
      }
    },

    setLoading(state, action) {
      const {key, loading} = action.payload
      return {
        ...state,
        spinLoading: {
          ...state.spinLoading,
          [key]: loading,
        },
      }
    },

  },
  effects: {
    // 获取stage data set list
    * fetchStagingDatasetList(action, {call, put, select}) {
      const projectId = action.payload.projectId;
      const {data: stagingDataList} = yield call(stagingDataService.fetchStagingDatas, projectId);
      yield put({type: 'setStagingDataList', payload: {stagingDataList}})

    },

    * fetchTable(action, {call, put, select}) {
      yield put({
        type: 'setLoading', payload: {
          key: 'fetchTable',
          loading: true,
        },
      })

      const aa = yield call(stagingDataService.fetchStagingDataset, action.payload._id);
      const {data: table} = aa

      yield put({type: 'setTable', payload: {table}})

      yield put({
        type: 'setLoading', payload: {
          key: 'fetchTable',
          loading: false,
        },
      })

    }
  },

  subscriptions: {
    setup({dispatch, history}) {
      return history.listen(({pathname}) => {
        const match = pathToRegexp('/workspace/:projectId/:category').exec(pathname);
        if (match) {
          let projectId = match[1];

          //将project id存起来
          dispatch({type: 'setProjectId', payload: {projectId: projectId}});
          dispatch({type: 'fetchStagingDatasetList', payload: {projectId: projectId}});

        }
      });
    },
  }

}
