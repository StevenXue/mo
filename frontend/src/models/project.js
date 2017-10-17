import { fetchProjects } from '../services/project'
import { privacyChoices } from '../constants'

export default {
  namespace: 'project',
  state: {
    projects: [],
    privacy: 'all',
  },
  reducers: {
    setProjects(state, { payload: projects }) {
      return {
        ...state,
        projects,
      }
    },
  },
  effects: {
    // 获取用户所有 project
    *fetch(action, { call, put, select }) {
      // select login info
      let user_ID = 'dev_1'
      const { data: projects } = yield call(fetchProjects, { user_ID, privacy: action.privacy })
      yield put({ type: 'setProjects', payload: projects })
    },
  },
  subscriptions: {
    // 当进入该页面是 获取用户所有 project
    setup({ dispatch, history }) {
      return history.listen(({ pathname }) => {
        if (pathname === '/projects') {
          dispatch({ type: 'fetch', privacy: 'all' })
        }
      })
    },
  },
}
