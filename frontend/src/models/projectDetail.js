import { fetchProject } from '../services/project'
import { privacyChoices } from '../constants'
import pathToRegexp from 'path-to-regexp';

export default {
  namespace: 'projectDetail',
  state: {},
  reducers: {
    setProject(state, { payload: project }) {
      return {
        ...state,
        project,
      }
    },
  },
  effects: {
    // 获取用户所有 project
    *fetch(action, { call, put, select }) {
      const { data: project } = yield call(fetchProject, { projectID: action.projectID })
      yield put({ type: 'setProject', payload: project })
    },
  },
  subscriptions: {
    // 当进入该页面获取project
    setup({ dispatch, history }) {
      return history.listen(({ pathname }) => {
        const match = pathToRegexp('/projects/:projectID').exec(pathname);
        if (match) {
          console.log(match);
          const projectID = match[1];
          dispatch({ type: 'fetch', projectID: projectID })
        }
      })
    },
  },
}
