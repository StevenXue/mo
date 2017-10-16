import { fetchProjects } from '../services/project'

export default {
  namespace: 'project',
  state: {
    projects: {
      'owned_projects': [],
      'public_projects': []
    },
  },
  reducers: {
    setProjects (state, { payload: projects }) {
      return {
        ...state,
        projects,
      }
    },
  },
  effects: {
    // 获取用户所有 project
    * fetch (action, { call, put }) {
      let user_ID = 'dev_1'
      const { data: projects } = yield call(fetchProjects, user_ID)
      // const projects = res.response
      yield put({ type: 'setProjects', payload: projects })

    },
  },
  subscriptions: {
// 当进入该页面是 获取用户所有 project
    setup ({ dispatch, history }) {
      return history.listen(({ pathname }) => {
        if (pathname === '/projects') {
          dispatch({ type: 'fetch' })
        }
      })
    },
  },
}
