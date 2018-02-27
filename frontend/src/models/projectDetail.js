import { routerRedux } from 'dva/router'

import { fetchProject, deleteProject, updateProject, forkProject } from '../services/project'
import { jobsByProject } from '../services/job'
import { privacyChoices } from '../constants'
import pathToRegexp from 'path-to-regexp'
import { get } from 'lodash'
import { hubPrefix } from '../utils/config'
import * as dataAnalysisService from '../services/dataAnalysis'
import { message } from 'antd/lib/index'

import { startLabBack } from './modelling'

export default {
  namespace: 'projectDetail',
  state: {
    jobs: [],
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
      yield !action.notStartLab && call(startLabBack, { payload: { hubUserName, hubToken } }, { call })
      // yield call(startLabFront)
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
    *update({ body, fetchData }, { call, put, select }) {
      const projectId = yield select(state => state.projectDetail.project._id)
      // const user_ID = 'dev_1'
      // body['user_ID'] = user_ID
      yield call(updateProject, {
        body, projectId,
        onJson: () => {
          fetchData && this.props.fetchData()
          this.props.dispatch({ type: 'project/hideModal' })
        },
      })
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
