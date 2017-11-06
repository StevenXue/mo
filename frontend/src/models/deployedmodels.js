import { routerRedux } from 'dva/router'
import { tokenLogin } from '../services/login'
import { fetchProjects, createProject, deleteProject, updateProject } from '../services/project'
import { fetchAllPublicServedModels } from '../services/deployedmodels'
import { privacyChoices } from '../constants'
import {arrayToJson} from '../utils/JsonUtils';

export default {
  namespace: 'public_served_models',
  state: {
    publicServedModels: [],
  },
  reducers: {
    setPublicServedModels(state, { payload: publicServedModels }) {
      return {
        ...state,
        publicServedModels,
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
      const { data: models } = yield call(fetchAllPublicServedModels, { privacy: action.privacy, category: action.category})
      // const publicServedModels = arrayToJson(models, '_id');
      yield put({ type: 'setPublicServedModels', payload: models })
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
        if (pathname === '/modelmarkets') {
          dispatch({ type: 'fetch', privacy: 'public',category: 'All' })
        } else if (pathname === '/modelmarkets') {
          dispatch({ type: 'fetch', privacy: 'public',category: 'All' })
        }
      })
    },
  },
}
