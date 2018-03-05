import modelExtend from 'dva-model-extend'
import pathToRegexp from 'path-to-regexp'
import _, { get, isEqual } from 'lodash'
import * as dataAnalysisService from '../services/dataAnalysis'
import { startLab, getLabConfig } from '../services/notebook'

import {
  PageConfig,
} from '../packages/jupyterlab_package/packages/coreutils'

import workBench from './workBench'

import { getRound } from '../utils/number'
import { hubPrefix } from '../utils/config'
import { fetchProject } from '../services/project'

const categories = 'model'
// check value includes any of
const checker = (value, arr) =>
  arr.some(element => value.includes(element))

const extFilter = {
  app: ['moduledeploy-extension'],
  module: ['appdeploy-extension'],
  dataset: ['moduledeploy-extension', 'datasets-extension', 'appdeploy-extension'],
}

// Load the core theming before any other package.
require('../packages/jupyterlab_package/packages/theme-light-extension/style/embed.css')
require('../packages/jupyterlab_package/node_modules/font-awesome/css/font-awesome.min.css')

const loadnStartJL = (projectType) => {

  const allPackages = [
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
    require('../packages/jupyterlab_package/packages/datasets-extension'),
    require('../packages/jupyterlab_package/packages/moduledeploy-extension'),
    require('../packages/jupyterlab_package/packages/appdeploy-extension'),
  ]

  const JupyterLab = require('../packages/jupyterlab_package/packages/application').JupyterLab

  // filter packages
  const mods = allPackages.filter((p) => {
    if (_.isArray(p.default)) {
      return !p.default.find(ext => checker(ext.id, extFilter[projectType]))
    } else {
      return !checker(p.default.id, extFilter[projectType])
    }
  })
  let lab = new JupyterLab({
    name: 'Mo Lab',
    namespace: 'mo-lab',
    version: 'v0.1',
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
  for (let key in jupyterConfigData) {
    PageConfig.setOption(key, jupyterConfigData[key])
  }
  localStorage.setItem('name', Math.random())
  JCD.innerHTML = JSON.stringify(jupyterConfigData)
  document.head.insertBefore(JCD, document.head.children[3])
}

const onSuccess = async (res) => {
  const html = await res.text()
  insertConfigData(html)
}

export function *startLabFront({ payload: { projectType } }, { call }) {
  // load lab frontend
  let labContainer = document.getElementById('mo-jlContainer')
  if (labContainer !== null) {

    while (labContainer.firstChild) {
      console.log('delete')
      labContainer.removeChild(labContainer.firstChild)
    }
    // let apps = document.getElementsByClassName('p-Widget jp-ApplicationShell')
    // if (apps.length !== 0) {
    //   for (let app of apps) {
    //     app.remove()
    //   }
    // }
    console.log('app2', labContainer.firstChild)

    loadnStartJL(projectType)
  }
}

export function *startLabBack({ payload: { hubUserName, hubToken } }, { call }) {
  // auth hub fake user and start lab backend
  yield call(startLab, { hubUserName, hubToken })
}

export function *insertLabConfig({ payload: { hubUserName, hubToken } }, { call }) {
  // insert lab config from hub
  const configDataNode = document.getElementById('jupyter-config-data')
  if (configDataNode !== null) {
    configDataNode.remove()
  }
  yield call(getLabConfig, { hubUserName, hubToken, onSuccess })
}

const modelling = modelExtend(workBench, {
  namespace: 'modelling',
  state: {},
  reducers: {
    setModels(state, action) {
      let lengthModelsJson = Object.keys(action.payload.sectionsJson).length
      let { payload: { sectionsJson } } = action
      if (lengthModelsJson > 0) {
        for (let modelKey in sectionsJson) {
          let metrics = {
            'acc': [],
            'precision': [],
            'recall': [],
            'loss': [],
            'val_acc': [],
            'val_precision': [],
            'val_recall': [],
            'val_loss': [],
          }
          for (let eachMetricHis of Object.values(get(sectionsJson[modelKey], 'metrics_status', {}))) {
            for (let metric of Object.keys(metrics)) {
              if (eachMetricHis[metric] !== undefined) {
                metrics[metric].push(getRound(eachMetricHis[metric], 2))
              }
            }
          }
          // 剔除空的metrics
          for (let metric of Object.keys(metrics)) {
            if (metrics[metric].length === 0) {
              delete metrics[metric]
            }
          }

          sectionsJson[modelKey]['metrics_status'] = metrics
        }

        return {
          ...state,
          sectionsJson: sectionsJson,
          focusModelId: Object.keys(action.payload.sectionsJson)[0],
        }
      }
      else {
        return {
          ...state,
          sectionsJson: sectionsJson,
          focusModelId: null,
        }
      }
    },
    setMetrics(state, { payload }) {
      const { msg } = payload
      const sectionId = msg.job_id
      let sectionsJson = state.sectionsJson
      console.log('message', msg)

      let metrics = {
        'acc': [],
        'precision': [],
        'recall': [],
        'loss': [],
        'val_acc': [],
        'val_precision': [],
        'val_recall': [],
        'val_loss': [],
      }

      if (sectionsJson[sectionId].metrics_status) {
        for (let metric in metrics) {
          if (msg[metric] !== undefined) {
            if (!sectionsJson[sectionId].metrics_status[metric]) {
              sectionsJson[sectionId].metrics_status[metric] = [msg[metric]]
            } else {
              sectionsJson[sectionId].metrics_status[metric].push(msg[metric])
            }
          }
        }
      } else {
        for (let metric in metrics) {
          if (msg[metric] !== undefined) {
            metric[metric].push(msg[metric])
          }
        }

        for (let metric of Object.keys(metrics)) {
          if (metrics[metric].length === 0) {
            delete metrics[metric]
          }
        }
        sectionsJson[sectionId].metrics_status = metrics
      }

      // receive batch
      if (msg.batch) {
        sectionsJson[sectionId].batch = msg.batch
      }

      if (msg.total_steps !== undefined && msg.n !== undefined) {
        sectionsJson[sectionId].percent = (msg.n + 1) / msg.total_steps * 100
      }

      console.log('sectionsJson', sectionsJson, sectionsJson[sectionId].percent)
      return {
        ...state,
        sectionsJson,
      }
    },
    clearMetrics(state, { payload }) {
      let sectionsJson = state.sectionsJson
      sectionsJson[payload.sectionId].metrics_status = {}
      sectionsJson[payload.sectionId].batch = undefined
      return {
        ...state,
        sectionsJson,
      }
    },
  },
  effects: {
    *startLabBnF({ projectId, projectType }, { call, put, select }) {
      let project = yield select(state => state.projectDetail['project'])
      if (project === undefined) {
        ({ data: project } = yield call(fetchProject, { projectId }))
        // yield put({ type: 'projectDetail/setProject', payload: project })
      }
      document.title = `${project.name}:${projectType.charAt(0).toUpperCase() + projectType.substring(1)} - MO`

      const hubUserName = encodeURIComponent(`${localStorage.getItem('user_ID')}+${project.name}`)
      const hubToken = project.hub_token
      yield call(startLabBack, { payload: { hubUserName, hubToken } }, { call })
      yield call(insertLabConfig, { payload: { hubUserName, hubToken } }, { call })
      // loadnStartJL(projectType)
      document.body = document.createElement('body')
      // document.body.setAttribute('style', "overflow: auto;")
      yield call(loadnStartJL, projectType)
    },
    *runSection(action, { call, put, select }) {
      const { namespace, sectionId } = action.payload
      yield put({ type: 'clearMetrics', payload: { sectionId } })
      yield put({ type: 'showResult' })
      yield put({
        type: 'setLoading', payload: {
          key: 'wholePage',
          loading: true,
        },
      })
      yield put({
        type: 'setStatus', payload: {
          sectionId,
          status: 100,
        },
      })

      // 先把 save section 复制过来
      const sectionsJson = yield select(state => state[namespace].sectionsJson)
      const section = sectionsJson[sectionId]
      yield call(dataAnalysisService.saveSection, { section: section })

      const projectId = yield select(state => state[namespace].projectId)

      const { data: { result: { result } } } = yield call(dataAnalysisService.runJob, {
        ...action.payload,
        projectId: projectId,
      })

      // 更新result
      yield put({
        type: 'setSectionResult', payload: {
          sectionId,
          result,
        },
      })
      yield put({
        type: 'setLoading', payload: {
          key: 'wholePage',
          loading: false,
        },
      })
    },
  },
  subscriptions: {
    // 当进入该页面是 获取用户所有 section
    setup({ dispatch, history }) {
      return history.listen(({ pathname }) => {
        const match = pathToRegexp('/workspace/:projectId/:type').exec(pathname)
        if (match) {
          let projectId = match[1]
          let type = match[2]
          dispatch({ type: 'startLabBnF', projectId, projectType: type })
          dispatch({ type: 'fetchSections', projectId, categories })
          dispatch({ type: 'fetchAlgorithms', categories })
          // dispatch({ type: 'fetchStagingDatasetList', projectId: projectId })

          //将project id存起来
          dispatch({ type: 'setProjectId', payload: { projectId } })
        }
      })
    },

  },
})

export default modelling

