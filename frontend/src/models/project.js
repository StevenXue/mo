import { fetchProjects } from '../services/project'
import { privacyChoices } from '../constants'

export default {
  namespace: 'project',
  state: {
    projects: [],
  },
  reducers: {
    *create({ payload }, { call, put, select }) {
      const user = 'dev_1'
      let body = payload
      body['user_ID'] = user.user_ID
      const data = yield call(create, body)
      yield put({ type: 'query' })
      yield put({ type: 'hideModal' })
    },

    setProjects(state, { payload: projects }) {
      return {
        ...state,
        projects,
      }
    },

    showModal(state) {
      return { ...state, modalVisible: true }
    },

    hideModal(state) {
      return { ...state, modalVisible: false }
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
