import { routerRedux } from 'dva/router'
import { fetchProjects, createProject, deleteProject, updateProject } from '../services/project'
import { privacyChoices } from '../constants'

export default {
  namespace: 'project',
  state: {
    projects: [],
  },
  reducers: {
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
    *fetch(action, { call, put, select, take }) {
      const { payload } = yield take('login/setUser')
      const user_ID = payload.user_ID
      // const user_ID = yield select(state => state.login.user.user_ID)
      // const user_ID = 'dev_1'
      const { data: projects } = yield call(fetchProjects, { user_ID, privacy: action.privacy })
      yield put({ type: 'setProjects', payload: projects })
    },

    *create({ body }, { call, put, select }) {
      // const user_ID = 'dev_1'
      body['user_ID'] = yield select(state => state.login.user.user_ID)
      yield call(createProject, { body })
      yield put({ type: 'hideModal' })
      yield put({ type: 'fetch', privacy: 'all' })
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
