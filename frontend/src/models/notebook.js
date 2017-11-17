import { routerRedux } from 'dva/router'

import * as notebookService from '../services/notebook'
import * as jobService from '../services/job'
import * as dataAnalysisService from '../services/dataAnalysis'
import { privacyChoices } from '../constants'
import pathToRegexp from 'path-to-regexp'
import { cloneDeep, isEmpty } from 'lodash'
import { saveSection } from './workBench'
import empty from '../routes/workspace/modelling/Notebook/empty.ipynb'

export default {
  namespace: 'notebook',
  state: {
    notebookLoading: false,
    on: {},
    forceSource: {},
    fileList: [],
    notebookName: '',
    notebookPath: {},
    editing: false,
    data_id: '',
    start_notebook: false,
    visible: false,
    data_prop: 'owned_ds',
    selectedData: '',
    dataSet: [],
    dataset_name: 'DataSet Selected',
    to_disconnect: false,
    notebook: empty,
    spawn_new: false,
    columns: [],
    stagingDataID: '',
  },
  reducers: {
    setForceSource(state, { payload: { forceSource: _forceSource, sectionId } }) {
      let forceSource = state.forceSource
      forceSource[sectionId] = _forceSource
      return {
        ...state,
        forceSource,
      }
    },
    toggleNotebook(state, { payload: { sectionId } }) {
      let on = state.on
      if(on[sectionId] !== undefined) {
        on[sectionId] = !on[sectionId]
      } else {
        on[sectionId] = true
      }
      return {
        ...state,
        on,
      }
    },
    setProjectId(state, { payload: { project_id } }) {
      return {
        ...state,
        project_id,
      }
    },
    setUserId(state, { payload: { userId } }) {
      return {
        ...state,
        userId,
      }
    },
    setPort(state, { payload: { port } }) {
      return {
        ...state,
        port,
      }
    },
    newNotebook(state, { payload: { start_notebook, notebookName, spawn_new } }) {
      return {
        ...state,
        start_notebook,
        notebookName,
        spawn_new,
      }
    },
    setNotebook(state, { payload: { notebook, notebookName } }) {
      return {
        ...state,
        notebook,
        notebookName,
      }
    },
    start(state) {
      return {
        ...state,
        start_notebook: true,
      }
    },
    setLoading(state, action) {
      const { key, loading } = action.payload
      return {
        ...state,
        [key]: loading,
      }
    },
  },
  effects: {
    // 获取用户所有 project
    *startNotebook({ payload }, { call, put, select }) {
      const { sectionId } = payload
      const namespace = 'modelling'
      yield put({ type: 'setLoading', payload: { key: 'notebookLoading', loading: true } })
      yield put({ type: 'toggleNotebook', payload: { sectionId } })
      const projectId = yield select(state => state.projectDetail.project._id)
      const userId = yield select(state => state.login.user.user_ID)

      yield call(saveSection, { payload: { namespace: 'modelling', sectionId } }, { call, put, select })

      // yield* put({ type: 'modelling/saveSection', payload: { sectionId, namespace: 'modelling' } })
      yield put({ type: 'setUserId', payload: { userId } })

      let { data: { code: forceSource } } = yield call(jobService.jobToCode, { projectId, sectionId })
      yield put({ type: 'setForceSource', payload: { sectionId, forceSource } })

      let { data: port, status } = yield call(notebookService.startNotebook, { projectId })
      if (status !== 200) {
        ({ data: port, status } = yield call(notebookService.createNotebook, { projectId }))
      }

      yield put({ type: 'setPort', payload: { port } })
      const { res } = yield call(notebookService.enterNotebook, { port })
      let notebook_content = {}
      let response = cloneDeep(res)
      if (response.content instanceof Array && response.content[0]) {
        let content = response.content
        notebook_content = content.find((el) => el.type === 'notebook')
      }
      // 如果没有ipynb文件，新建一个
      if (isEmpty(notebook_content)) {
        yield put({
          type: 'newNotebook', payload: {
            start_notebook: true,
            notebookName: 'empty',
            spawn_new: true,
          },
        })
      } else {
        const { data, status } = yield call(notebookService.openNotebook, { path: notebook_content.path, port })
        if (status === 200) {
          yield put({
            type: 'setNotebook', payload: {
              notebook: res.content,
              notebookName: notebook_content.name,
            },
          })
          yield put({ type: 'start' })
        }
      }
      yield put({ type: 'setLoading', payload: { key: 'notebookLoading', loading: false } })
    },
  },
  subscriptions: {
    // setup({ dispatch, history }) {
    //   return history.listen(({ pathname }) => {
    //     const match = pathToRegexp('/workspace/:projectId*').exec(pathname)
    //     if (match) {
    //       const projectId = match[1]
    //       dispatch({ type: 'fetch', projectId: projectId })
    //     }
    //   })
    // },
  },
}
