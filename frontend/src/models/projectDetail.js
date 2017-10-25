import { routerRedux } from 'dva/router'

import { fetchProject, deleteProject, updateProject } from '../services/project'
import { privacyChoices } from '../constants'
import pathToRegexp from 'path-to-regexp'

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
      const { data: project } = yield call(fetchProject, { projectId: action.projectId })
      yield put({ type: 'setProject', payload: project })
    },

    *delete({ payload }, { call, put, select }) {
      const user_ID = yield select(state => state.login.user.user_ID)
      // const user_ID = 'dev_1'
      payload['user_ID'] = user_ID
      yield call(deleteProject, payload)
      yield put(routerRedux.push('/projects'))
    },

    *update({ body }, { call, put, select }) {
      const projectId = yield select(state => state.projectDetail.project._id)
      // const user_ID = 'dev_1'
      // body['user_ID'] = user_ID
      yield call(updateProject, { body, projectId })
      yield put({ type: 'project/hideModal' })
      yield put({ type: 'fetch', projectId: projectId })
    },
  },
  subscriptions: {
    // 当进入该页面获取project
    setup({ dispatch, history }) {
      return history.listen(({ pathname }) => {
        const match = pathToRegexp('/projects/:projectId').exec(pathname)
        if (match) {
          const projectId = match[1]
          dispatch({ type: 'fetch', projectId: projectId })
        }
      })
    },
  },
}
