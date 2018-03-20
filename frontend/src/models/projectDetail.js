import {routerRedux} from 'dva/router'

import { fetchProject, deleteProject, updateProject, forkProject } from '../services/project'
import { fetchApp } from '../services/app'
import { getSessions, getTerminals, deleteSession, deleteTerminal } from '../services/job'
import { deleteLab, startLab } from '../services/notebook'
import { privacyChoices } from '../constants'
import pathToRegexp from 'path-to-regexp'
import {get} from 'lodash'
import {hubPrefix} from '../utils/config'
import * as dataAnalysisService from '../services/dataAnalysis'
import {message} from 'antd/lib/index'
import CONSTANT from '../constants'

import * as UserStarFavorService from '../services/user'
import * as AppService from '../services/app'

export default {
  namespace: 'projectDetail',
  state: {
    terminals: [],
    sessions: [],
    // doneIndices: new Set([]),
    overviewEditState: false,
  },
  reducers: {
    showOverviewEditState(state) {
      return {
        ...state,
        overviewEditState: true,
      }
    },

    hideOverviewEditState(state) {
      return {
        ...state,
        overviewEditState: false,
      }
    },
    setProject(state, { payload: project }) {
      return {
        ...state,
        project,
      }
    },
    setTerminals(state, {payload: terminals}) {
      return {
        ...state,
        terminals,
      }
    },
    setSessions(state, {payload: sessions}) {
      return {
        ...state,
        sessions,
      }
    },
    setStep(state, {payload}) {
      const {index} = payload
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

    updateStarFavor(state, action) {
      return {
        ...state,
        project: action.payload.project,
      }
    },
    changeOverview(state, action) {
      return {
        ...state,
        project: {
          ...state.project,
          overview: action.payload.overview,
        },
      }
    },
    clearProject(state, action) {
      return {
        ...state,
        project: null,
      }
    },
    setExampleResult(state, action){
      let output = state.project.args.output
      for(let key in action.payload){
        output[key]['value']=action.payload[key]
      }
      return {
        ...state,
        project:{
          ...state.project,
          args:{
            ...state.project.args,
            output:output
          }
        }
      }
    }

  },
  effects: {
    // 获取该 project
    * fetch({projectId, notStartLab, projectType}, {call, put}) {
      yield put({type: 'clearProject'})
      const fetchMapper = {
        app: fetchApp,
        module: fetchProject,
        dataset: fetchProject,
        project: fetchProject,
      }
      // fetch and set project
      let {data: project} = yield call(fetchMapper[projectType], {projectId})
      yield put({type: 'setProject', payload: project})
      // start lab backend
      const hubUserName = encodeURIComponent(`${localStorage.getItem('user_ID')}+${project.name}`)
      const hubToken = project.hub_token
      if (!notStartLab) {
        yield call(startLab, { hubUserName, hubToken })
        // fetch and set project for tb_port restarted by startLab
        project = (yield call(fetchMapper[projectType], { projectId })).data
        yield put({ type: 'setProject', payload: project })
      }

      const defaultDocs = CONSTANT.defaultOverviewDocs

      if (!project.overview) {
        project['overview'] = defaultDocs
      }
      else {
        project['overview'] = { 'text': project['overview'] }
      }
      yield put({type: 'setProject', payload: project})

      // fetch jobs
      const {data: terminals} = yield call(getTerminals, {
        hubUserName,
        hubToken
      })
      const {data: sessions} = yield call(getSessions, {hubUserName, hubToken})
      yield put({type: 'setTerminals', payload: terminals})
      yield put({type: 'setSessions', payload: sessions})
    },
    * closeSession({sessionId, terminalName}, {call, put, select}) {
      const project = yield select(state => get(state, 'projectDetail.project'))
      const hubUserName = encodeURIComponent(`${localStorage.getItem('user_ID')}+${project.name}`)
      const hubToken = project.hub_token
      yield sessionId && call(deleteSession, {hubUserName, hubToken, sessionId})
      yield terminalName && call(deleteTerminal, {
        hubUserName,
        hubToken,
        terminalName
      })
      yield put({type: 'fetch', projectId: project._id})
    },
    // 获取该 project 的 Jobs
    // *fetchJobs(action, { call, put }) {
    //   // const hubUserName = `${localStorage.getItem('user_ID')}+${project.name}`
    //   const jobs = yield call(jobsByProject, { projectId: action.projectId })
    //   yield put({ type: 'setJobs', payload: jobs })
    // },
    * delete({payload}, {call, put, select}) {
      yield call(deleteProject, payload)
      yield put(routerRedux.push('/workspace'))

      // hub user will deleted in backend, no need to stop hub user server
      // let project = yield select(state => state.projectDetail['project'])
      // const hubUserName = encodeURIComponent(`${localStorage.getItem('user_ID')}+${project.name}`)
      // const hubToken = project.hub_token
      // yield call(deleteLab, {hubUserName, hubToken})

    },
    * setEntered({projectId}, {call, put}) {
      console.log(projectId)
      yield call(updateProject, {projectId, body: {entered: true}})
      yield put({type: 'fetch', projectId})
    },
    * update({body, fetchData}, {call, put, select}) {
      const projectId = yield select(state => state.projectDetail.project._id)
      // const user_ID = 'dev_1'
      // body['user_ID'] = user_ID
      yield call(updateProject, {
        body, projectId,
        onJson: () => {
          fetchData && this.props.fetchData()
          this.props.dispatch({ type: 'project/hideModal' })
          this.props.dispatch({ type: 'projectDetail/hideOverviewEditState' })
        },
      })
      yield put({type: 'project/hideModal'})
      yield put({type: 'fetch', projectId})
    },
    * setDoneStep({payload}, {call, put, select}) {
      yield put({type: 'setStep', payload})
      const project = yield select(state => get(state, 'projectDetail.project'))
      const projectId = project._id
      delete project._id
      let {data: newProject} = yield call(updateProject, {
        body: project,
        projectId
      })
      // yield put({ type: 'setProject', payload: newProject })
    },

    * fork({payload}, {call, put, select}) {
      const projectId = yield select(state => state.projectDetail.project._id)
      const res = yield call(forkProject, projectId)
      yield put({type: 'setProject', payload: res.data})
      const url0 = `/workspace/${res.data._id}`
      yield put(routerRedux.replace(url0))
    },

    * star_favor(action, {call, put, select}) {
      let payload = action.payload
      const {data: project} = yield call(UserStarFavorService.set_star_favor, payload)
      yield put({
        type: 'updateStarFavor',
        payload: project,
      })
    },

    * get_example_result(action, {call, put, select}){
      let payload = action.payload
      const {data: result} = yield call(AppService.runApi, payload)
      console.log(result,'resssss')
      yield put({
        type: 'setExampleResult',
        payload: result,
      })
    }
  },
  subscriptions: {
    // 当进入该页面获取project
    setup({dispatch, history}) {
      return history.listen(({pathname}) => {
        const match = pathToRegexp('/workspace/:projectId/:type?').exec(pathname)
        const match2 = pathToRegexp('/market/:projectId/:type?').exec(pathname)
        const url = new URL(location.href.replace('/#', ''))
        if (match) {
          const projectId = match[1]
          const projectType = url.searchParams.get('type') || match[2]
          dispatch({type: 'fetch', projectId, projectType})
          // dispatch({ type: 'fetchJobs', projectId: projectId })
        } else if (match2) {
          const projectId = match2[1]
          const projectType = url.searchParams.get('type') || match[2]

          dispatch({type: 'fetch', projectId, projectType})
        }
      })
    },
  },
}
