import { routerRedux } from 'dva/router'
import { message } from 'antd'
import {
  fetchProject,
  deleteProject,
  updateProject,
  forkProject,
} from '../services/project'
import { fetchApp } from '../services/app'
import { fetchModule } from '../services/module'
import { fetchDataset } from '../services/dataset'
import {
  getJobs,
  getSessions,
  getTerminals,
  deleteSession,
  deleteTerminal,
  terminateJob,
} from '../services/job'
import { deleteLab, startLab } from '../services/notebook'
import { privacyChoices } from '../constants'
import pathToRegexp from 'path-to-regexp'
import { get } from 'lodash'
import { hubPrefix } from '../utils/config'
import * as dataAnalysisService from '../services/dataAnalysis'
import CONSTANT from '../constants'

import * as UserStarFavorService from '../services/user'
import * as AppService from '../services/app'
import * as commentsService from '../services/comments'

export default {
  namespace: 'projectDetail',
  state: {
    // terminals: undefined,
    // sessions: [],
    jobs: {},
    jobIds: [],
    // doneIndices: new Set([]),
    helpModalVisible: false,
    activeTab: '1',
    pageNo: 1,
    pageSize: 10,
    resultLoading: false,
    overviewEditorState: false,
    loadingOverview: false,
  },
  reducers: {
    changeActiveTab(state, { activeTab }) {
      return { ...state, activeTab }
    },
    addJobLog(state, { payload: jobId }) {
      let jobIds = state.jobIds
      if (!jobIds.includes(jobId)) {
        jobIds.push(jobId)
      }
      return {
        ...state,
        jobIds,
      }
    },
    removeJobLog(state, { payload: jobId }) {
      let jobIds = state.jobIds
      if (jobIds.includes(jobId)) {
        jobIds.splice(jobIds.indexOf(jobId), 1)
      }
      return {
        ...state,
        jobIds,
      }
    },
    showHelpModal(state) {
      return { ...state, helpModalVisible: true }
    },
    hideHelpModal(state) {
      return { ...state, helpModalVisible: false }
    },
    setProjectReducer(state, { payload: project }) {
      return {
        ...state,
        project: {
          ...state.project,
          ...project,
        },
      }
    },
    setTerminals(state, { payload: terminals }) {
      return {
        ...state,
        terminals,
      }
    },
    setSessions(state, { payload: sessions }) {
      return {
        ...state,
        sessions,
      }
    },
    setActiveTab(state, { payload: activeTab }) {
      return {
        ...state,
        activeTab,
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

    updateStarFavor(state, { project }) {
      let star_users = project.star_users
      let favor_users = project.favor_users
      return {
        ...state,
        project: {
          ...state.project,
          star_users,
          favor_users,
        },
      }
    },
    changeOverviewLoading(state) {
      return {
        ...state,
        loadingOverview: !state.loadingOverview,
      }
    },
    setOverviewEditorState(state, { overviewEditorState }) {
      return {
        ...state,
        overviewEditorState,
      }
    },
    setVersion(state, { version }) {
      return {
        ...state,
        version,
      }
    },
    clearProject(state, action) {
      return {
        ...state,
        project: undefined,
        activeTab: '1',
        resultLoading: false,
      }
    },

    setCommentsPageNoSize(state, { pageNo, pageSize }) {
      return {
        ...state,
        pageNo,
        pageSize,
      }
    },

    setProjectComments(state, { comments, totalNumber }) {
      return {
        ...state,
        comments,
        totalNumber,
      }
    },

    setResultLoading(state, { resultLoading }) {
      return {
        ...state,
        resultLoading,
      }
    },

    setExampleResult(state, action) {
      let output = state.project.args.output
      for (let key in action.payload) {
        if (output[key]) {
          output[key]['value'] = action.payload[key]
        }
      }

      let errors = action.payload.errors
      if (errors) {
        output.errors = errors
      }

      return {
        ...state,
        project: {
          ...state.project,
          args: {
            ...state.project.args,
            output,
          },
        },
      }
    },
  },
  effects: {
    *refresh({ projectId, notStartLab, projectType, version, activeTab, match }, { call, put, select }) {
      yield put({ type: 'clearProject' })
      yield put({ type: 'fetch', projectId, projectType, version, activeTab, match, notStartLab })
      yield put({ type: 'fetchComments', projectId })
    },

    *updateProjectOverview({ projectId, body }, { call, put }) {
      yield put({ type: 'changeOverviewLoading' })
      const { data: project } = yield call(updateProject, {
        projectId,
        body,
      })
      yield put({ type: 'setProject', payload: project })
      yield put({ type: 'changeOverviewLoading' })
      yield put({ type: 'setOverviewEditorState', overviewEditorState: false })
      message.success('Overview修改成功')
    },

    // 获取 project 下的 comments
    *fetchComments({ projectId }, { call, put, select }) {
      const pageNo = yield select(state => get(state, 'projectDetail.pageNo'))
      const pageSize = yield select(state => get(state, 'projectDetail.pageSize'))

      let payload = {
        'page_no': pageNo,
        'page_size': pageSize,
        'comments_type': 'project',
        '_id': projectId,
      }

      const { data } = yield call(commentsService.fetchComments, {
        payload,
      })
      const comments = data.comments
      const totalNumber = data.total_number
      yield put({ type: 'setProjectComments', comments, totalNumber })
    },

    // 获取该 project
    *fetch({ projectId, notStartLab, projectType, version, activeTab, match }, { call, put, select }) {
      yield activeTab && put({ type: 'setActiveTab', payload: activeTab })
      const fetchMapper = {
        app: fetchApp,
        module: fetchModule,
        dataset: fetchDataset,
        project: fetchProject,
      }
      // fetch and set project
      let { data: project } = yield call(fetchMapper[projectType], {
        projectId,
        version,
      })

      const projectDetailOwner = project.user_ID
      const user_ID = localStorage.getItem('user_ID')
      if (match && match[0] === `/explore/${projectId}` && projectDetailOwner === user_ID) {
        yield put(routerRedux.push(`/workspace/${projectId}?type=${projectType}`))
      }
      if (match && match[0] === `/workspace/${projectId}` && projectDetailOwner !== user_ID) {
        console.log('projectDetailOwner', projectDetailOwner)
        yield put(routerRedux.push(`/explore/${projectId}?type=${projectType}`))
      }

      // start lab backend
      const hubUserName = encodeURIComponent(`${localStorage.getItem('user_ID')}+${project.name}`)
      const hubToken = project.hub_token
      if (!notStartLab) {
        yield call(startLab, { hubUserName, hubToken })
        // fetch and set project for tb_port restarted by startLab
        project = (yield call(fetchMapper[projectType], {
          projectId,
          version,
        })).data
        // yield put({ type: 'setProject', payload: project })
      }

      yield put({ type: 'setProject', payload: project })
      // fetch jobs
      try {
        const { data: terminals } = yield call(getTerminals, {
          hubUserName,
          hubToken,
        })
        const { data: sessions } = yield call(getSessions, {
          hubUserName,
          hubToken,
        })
        // jobs is a dict with notebook path as key
        const { data: jobs } = yield call(getJobs, {
          projectId,
          projectType,
        })
        sessions.forEach(sess => {
          if (jobs[sess.path] !== undefined) {
            sess.jobs = jobs[sess.path]
            delete jobs[sess.path]
          }
        })
        yield put({ type: 'setJobs', payload: jobs })
        yield put({ type: 'setTerminals', payload: terminals })
        yield put({ type: 'setSessions', payload: sessions })
      } catch (e) {
        console.log('get jobs', e)
      }
    },

    *makeComment(action, { call, put, select }) {
      let payload = action.payload
      yield call(commentsService.createComments, payload)
      let projectId = payload._id
      yield put({ type: 'fetchComments', projectId })
    },

    // wrapper to set tags when set project
    *setProject({ payload: project }, { call, put }) {
      const defaultDocs = CONSTANT.defaultOverviewDocs

      if (!project.overview) {
        project['overview'] = defaultDocs
      }
      else {
        project['overview'] = project['overview']
      }
      yield put({ type: 'setProjectReducer', payload: project })
      yield put({ type: 'project/setTags', payload: project.tags })
    },

    *closeSession({ sessionId, terminalName }, { call, put, select }) {
      const project = yield select(state => get(state, 'projectDetail.project'))
      const hubUserName = encodeURIComponent(`${localStorage.getItem('user_ID')}+${project.name}`)
      const hubToken = project.hub_token
      if (sessionId) {
        const sessions = yield select(state => get(state, 'projectDetail.sessions'))
        const session = sessions.find(sess => sess.id === sessionId)
        if (session.jobs) {
          for (let job of session.jobs) {
            if (job.status === 'running') {
              yield call(terminateJob, { jobId: job._id })
            }
          }
        }
        yield call(deleteSession, { hubUserName, hubToken, sessionId })
      }
      yield terminalName && call(deleteTerminal, {
        hubUserName,
        hubToken,
        terminalName,
      })
      yield put({
        type: 'fetch',
        projectId: project._id,
        projectType: project.type,
      })
    },
    *delete({ payload }, { call, put, select }) {
      const hide = message.loading('Project Deleting...', 0)
      yield call(deleteProject, payload)
      hide()
      yield put(routerRedux.push('/workspace?tab=' + payload.type))
    },
    *setEntered({ projectId }, { call, put }) {
      console.log(projectId)
      const { data: project } = yield call(updateProject, {
        projectId,
        body: { entered: true },
      })
      yield put({ type: 'setProject', payload: project })
    },
    *update({ payload }, { call, put }) {
      const { body, fetchData, projectId } = payload
      const { data: project } = yield call(updateProject, { body, projectId })
      yield fetchData && fetchData()
      yield put({ type: 'project/hideModal' })
      yield put({
        type: 'fetch',
        projectId: project._id,
        notStartLab: true,
        projectType: project.type,
      })
    },
    *setDoneStep({ payload }, { call, put, select }) {
      yield put({ type: 'setStep', payload })
      const project = yield select(state => get(state, 'projectDetail.project'))
      const projectId = project._id
      delete project._id
      let { data: newProject } = yield call(updateProject, {
        body: project,
        projectId,
      })
      // yield put({ type: 'setProject', payload: newProject })
    },

    *fork({ payload }, { call, put, select }) {
      const projectId = yield select(state => state.projectDetail.project._id)
      const res = yield call(forkProject, projectId)
      yield put({ type: 'setProject', payload: res.data })
      const url0 = `/workspace/${res.data._id}`
      yield put(routerRedux.replace(url0))
    },

    *starFavor(action, { call, put, select }) {
      let payload = action.payload
      const { data: { entity: project } } = yield call(UserStarFavorService.setStarFavor, payload)
      // console.log('ppp',project)
      yield put({
        type: 'updateStarFavor',
        project,
      })
    },

    *getExampleResult(action, { call, put, select }) {
      yield put({
        type: 'setResultLoading',
        resultLoading: true,
      })
      let payload = action.payload
      const { data: result } = yield call(AppService.runApi, payload)
      yield put({
        type: 'setExampleResult',
        payload: result,
      })
      yield put({
        type: 'setResultLoading',
        resultLoading: false,
      })
    },

    *updateProjectIsAutoHelp({ payload }, { call, put, select }) {
      const projectId = yield select(state => state.projectDetail.project._id)
      const result = yield call(updateProject, { body: payload, projectId })
    },
  },
  subscriptions: {
    // 当进入该页面获取project
    setup({ dispatch, history }) {
      return history.listen(({ pathname }) => {
        const match = pathToRegexp('/workspace/:projectId/:type?').exec(pathname)
        const match2 = pathToRegexp('/explore/:projectId/:type?').exec(pathname)
        const url = new URL(location.href.replace('/#', ''))
        if (match) {
          const projectId = match[1]
          const projectType = url.searchParams.get('type') || match[2]
          const activeTab = url.searchParams.get('tab')
          // when notebook path, lab will started in modelling model, no need to start here
          const notStartLab = match[2] !== undefined
          dispatch({ type: 'refresh', projectId, projectType, activeTab, match, notStartLab })
          // dispatch({ type: 'fetchJobs', projectId: projectId })
        } else if (match2) {
          const projectId = match2[1]
          const projectType = url.searchParams.get('type') || match[2]
          dispatch({ type: 'refresh', projectId, projectType, match: match2 })
        }
      })
    },
  },
}
