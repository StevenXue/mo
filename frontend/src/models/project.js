import { routerRedux } from 'dva/router'
import { tokenLogin } from '../services/login'
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
      // yield put({type: 'login/query'})
      // const { data: data } = yield call(tokenLogin)
      // console.log(data)
      // yield put({
      //   type: 'login/setUser',
      //   payload: data.user,
      // })
      // yield put({ type: 'setProjects', payload: [] })

      // const user_ID = yield select(state => state.login.user.user_ID)
      const { data: projects } = yield call(fetchProjects, { privacy: action.privacy })
      yield put({ type: 'setProjects', payload: projects })
    },

    *create({ body }, { call, put, select }) {
      // const user_ID = 'dev_1'
      // body['user_ID'] = yield select(state => state.login.user.user_ID)
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
