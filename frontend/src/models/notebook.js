import { routerRedux } from 'dva/router'

import * as notebookService from '../services/notebook'
import { privacyChoices } from '../constants'
import pathToRegexp from 'path-to-regexp'
import { cloneDeep, isEmpty } from 'lodash'
import empty from '../routes/workspace/modelling/Notebook/empty.ipynb'


export default {
  namespace: 'notebook',
  state: {
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
    setProjectId(state, { payload: { project_id } }) {
      return {
        ...state,
        project_id,
      }
    },
    setPort(state, { payload: { userId } }) {
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
  },
  effects: {
    // 获取用户所有 project
    *startNotebook(action, { call, put, select }) {
      const projectId = yield select(state => state.projectDetail.project._id)
      const userId = yield select(state => state.login.user.user_ID)
      yield put({ type: 'setUserId', payload: { userId } })

      let { data: port, status } = yield call(notebookService.startNotebook, { projectId })
      if (status !== 200) {
        ({ data: port, status } = yield call(notebookService.createNotebook, { projectId }))
      }
      // console.log('data', data)
      // const port = data
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
