import { routerRedux } from 'dva/router'
import { tokenLogin } from '../services/login'
import { fetchProjects, createProject, deleteProject, updateProject, getProjects } from '../services/project'
import { privacyChoices } from '../constants'

export default {
  namespace: 'project',
  state: {
    projects: [],
    projectsLoading: false,
    privacy: undefined,
    projectType: 'project',
    tags: [],
  },
  reducers: {
    setPrivacy(state, { payload: privacy }) {
      return {
        ...state,
        privacy,
      }
    },
    setTags(state, { payload: tags }) {
      return {
        ...state,
        tags,
      }
    },
    setType(state, { payload: projectType }) {
      return {
        ...state,
        projectType,
      }
    },
    setFilter(state, { payload: { key, value } }) {
      return {
        ...state,
        key: value,
      }
    },
    setProjects(state, { payload: projects }) {
      return {
        ...state,
        projects,
      }
    },

    setProjectsLoading(state, { payload: projectsLoading }) {
      return {
        ...state,
        projectsLoading,
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
    *fetch({ payload }, { call, put, select, take }) {
      // yield put({type: 'login/query'})
      // const { data: data } = yield call(tokenLogin)
      // console.log(data)
      // yield put({
      //   type: 'login/setUser',
      //   payload: data.user,
      // })
      // yield put({ type: 'setProjects', payload: [] })
      // const user_ID = yield select(state => state.login.user.user_ID)
      // const { data: projects } = yield call(fetchProjects, { privacy: action.privacy })
      let filter = {}
      yield select(state => {
        const project = state.project;
        ['query', 'projectType', 'privacy'].forEach((key) => {
          if (project[key]) {
            filter[key] = project[key]
          }
        })
      })
      if (payload) {
        for (let key in payload) {
          if (!payload.hasOwnProperty(key)) {
            continue
          }
          if (payload[key]) {
            filter[key] = payload[key]
            yield put({ type: 'setFilter', payload: { key, value: payload[key] } })
          }
        }
      }
      const { data: projects } = yield call(getProjects, { filter })
      yield put({ type: 'setProjects', payload: projects })
    },
    *fetchOthers(action, { call, put, select, take }) {
      yield put({ type: 'setProjectsLoading', payload: true })
      const { data: projects } = yield call(fetchProjects, { others: true })
      yield put({ type: 'setProjects', payload: projects })
      yield put({ type: 'setProjectsLoading', payload: false })
    },

    *push({id, route}, { call, put, select, take }) {
      yield put({ type: 'projectDetail/setProject', payload: undefined })
      yield put(routerRedux.push(`/${route}/${id}`))
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
    // 当进入该页面是 获取 project list
    setup({ dispatch, history }) {
      return history.listen(({ pathname }) => {
        if (pathname === '/workspace') {
          dispatch({ type: 'fetch' })
        } else if (pathname === '/projects') {
          dispatch({ type: 'fetchOthers' })
        }
      })
    },
  },
}
