import { routerRedux } from 'dva/router'

import { fetchProject, deleteProject, updateProject, forkProject } from '../services/project'
import { jobsByProject } from '../services/job'
import { startLab, getLabConfig } from '../services/notebook'
import { privacyChoices } from '../constants'
import pathToRegexp from 'path-to-regexp'
import { get } from 'lodash'
import { hubPrefix } from '../utils/config'
import * as dataAnalysisService from '../services/dataAnalysis'
import { message } from 'antd/lib/index'

const loadnStartJL = () => {
  // ES6 Promise polyfill
  require('es6-promise/auto')

// Load the core theming before any other package.
  require('../packages/jupyterlab_package/packages/theme-light-extension/style/embed.css')
  require('../packages/jupyterlab_package/node_modules/font-awesome/css/font-awesome.min.css')

  let JupyterLab = require('../packages/jupyterlab_package/packages/application').JupyterLab

  let mods = [
    require('../packages/jupyterlab_package/packages/application-extension'),
    require('../packages/jupyterlab_package/packages/apputils-extension'),
    require('../packages/jupyterlab_package/packages/codemirror-extension'),
    require('../packages/jupyterlab_package/packages/completer-extension'),
    require('../packages/jupyterlab_package/packages/console-extension'),
    require('../packages/jupyterlab_package/packages/csvviewer-extension'),
    require('../packages/jupyterlab_package/packages/docmanager-extension'),
    require('../packages/jupyterlab_package/packages/fileeditor-extension'),
    require('../packages/jupyterlab_package/packages/faq-extension'),
    require('../packages/jupyterlab_package/packages/filebrowser-extension'),
    require('../packages/jupyterlab_package/packages/help-extension'),
    require('../packages/jupyterlab_package/packages/imageviewer-extension'),
    require('../packages/jupyterlab_package/packages/inspector-extension'),
    require('../packages/jupyterlab_package/packages/launcher-extension'),
    require('../packages/jupyterlab_package/packages/mainmenu-extension'),
    require('../packages/jupyterlab_package/packages/markdownviewer-extension'),
    require('../packages/jupyterlab_package/packages/mathjax2-extension'),
    require('../packages/jupyterlab_package/packages/notebook-extension'),
    require('../packages/jupyterlab_package/packages/rendermime-extension'),
    require('../packages/jupyterlab_package/packages/running-extension'),
    require('../packages/jupyterlab_package/packages/settingeditor-extension'),
    require('../packages/jupyterlab_package/packages/shortcuts-extension'),
    require('../packages/jupyterlab_package/packages/tabmanager-extension'),
    require('../packages/jupyterlab_package/packages/terminal-extension'),
    require('../packages/jupyterlab_package/packages/theme-dark-extension'),
    require('../packages/jupyterlab_package/packages/theme-light-extension'),
    require('../packages/jupyterlab_package/packages/tooltip-extension'),

    require('../packages/jupyterlab_package/packages/modules-extension'),
  ]

  let lab = new JupyterLab({
    name: 'Mo Lab',
    namespace: 'mo-lab',
    version: 'unknown',
  })
  lab.registerPluginModules(mods)
  lab.start({ hostID: 'mo-jlContainer' })
}

const insertConfigData = (html) => {
  let el = document.implementation.createHTMLDocument()
  el.body.innerHTML = html
  let JCD = el.getElementById('jupyter-config-data')
  let jupyterConfigData = JSON.parse(JCD.innerHTML)
  for (let key in jupyterConfigData) {
    if (key === 'wsUrl' || key === 'pageUrl' || key === 'themesUrl') {
      continue
    }
    if (key.includes('Url')) {
      let value = jupyterConfigData[key]
      jupyterConfigData[key] = hubPrefix + value
    }
  }
  JCD.innerHTML = JSON.stringify(jupyterConfigData)
  document.head.insertBefore(JCD, document.head.children[3])
}

const onSuccess = async (res) => {
  const html = await res.text()
  if(document.getElementById('jupyter-config-data') === null) {
    insertConfigData(html)
  }
  if(document.getElementsByClassName('p-Widget jp-ApplicationShell').length === 0) {
    loadnStartJL()
  }
}

export default {
  namespace: 'projectDetail',
  state: {
    jobs: []
    // doneIndices: new Set([]),
  },
  reducers: {
    setProject(state, { payload: project }) {
      return {
        ...state,
        project,
      }
    },
    setJobs(state, { payload: jobs }) {
      return {
        ...state,
        jobs,
      }
    },
    setStep(state, { payload }) {
      const { index } = payload
      let project = state.project
      if (!project) {
        return state
      }
      if (project.done_indices) {
        let indices = new Set(project.done_indices)
        indices.add(index)
        project.done_indices = [...indices]
      } else {
        project.done_indices = [index]
      }
      return {
        ...state,
        project,
      }
    },
  },
  effects: {
    // 获取该 project
    *fetch(action, { call, put }) {
      const { data: project } = yield call(fetchProject, { projectId: action.projectId })
      yield put({ type: 'setProject', payload: project })
      const hubUserName = encodeURIComponent(`${localStorage.getItem('user_ID')}+${project.name}`)
      const hubToken = project.hub_token
      // start lab
      yield call(startLab, { hubUserName, hubToken })
      yield call(getLabConfig, { hubUserName, hubToken, onSuccess})
      // fetch jobs
      const jobs = yield call(jobsByProject, { hubUserName, hubToken })
      yield put({ type: 'setJobs', payload: jobs })
    },
    // 获取该 project 的 Jobs
    // *fetchJobs(action, { call, put }) {
    //   // const hubUserName = `${localStorage.getItem('user_ID')}+${project.name}`
    //   const jobs = yield call(jobsByProject, { projectId: action.projectId })
    //   yield put({ type: 'setJobs', payload: jobs })
    // },
    *delete({ payload }, { call, put, select }) {
      // const user_ID = 'dev_1'
      // payload['user_ID'] = yield select(state => state.login.user.user_ID)
      yield call(deleteProject, payload)
      yield put(routerRedux.push('/workspace'))
    },
    *update({ body }, { call, put, select }) {
      const projectId = yield select(state => state.projectDetail.project._id)
      // const user_ID = 'dev_1'
      // body['user_ID'] = user_ID
      yield call(updateProject, { body, projectId })
      yield put({ type: 'project/hideModal' })
      yield put({ type: 'fetch', projectId })
    },
    *setDoneStep({ payload }, { call, put, select }) {
      yield put({ type: 'setStep', payload })
      const project = yield select(state => get(state, 'projectDetail.project'))
      const projectId = project._id
      delete project._id
      let { data: newProject } = yield call(updateProject, { body: project, projectId })
      // yield put({ type: 'setProject', payload: newProject })
    },
    *fork({ payload }, { call, put, select }) {
      const projectId = yield select(state => state.projectDetail.project._id)
      const res = yield call(forkProject, projectId)
      yield put({ type: 'setProject', payload: res.data })
      const url0 = `/workspace/${res.data._id}`
      yield put(routerRedux.replace(url0))
    },
  },
  subscriptions: {
    // 当进入该页面获取project
    setup({ dispatch, history }) {
      return history.listen(({ pathname }) => {
        const match = pathToRegexp('/workspace/:projectId/:anything?').exec(pathname)
        const match2 = pathToRegexp('/projects/:projectId/:anything?').exec(pathname)
        if (match) {
          const projectId = match[1]
          dispatch({ type: 'fetch', projectId: projectId })
          // dispatch({ type: 'fetchJobs', projectId: projectId })
        } else if (match2) {
          const projectId = match2[1]
          dispatch({ type: 'fetch', projectId: projectId })
        }
      })
    },
  },
}
