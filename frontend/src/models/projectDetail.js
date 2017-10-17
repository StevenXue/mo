import { fetchProject } from '../services/project'
import { privacyChoices } from '../constants'

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
        const pathnames = pathname.split('/')
        if (pathnames[1] === 'projects' && pathnames.length >= 3) {
          console.log(pathnames)
          const [projectID] = pathnames.slice(-1)
          dispatch({ type: 'fetch', projectID: projectID })
        }
      })
    },
  },
}
