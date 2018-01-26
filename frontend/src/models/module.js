import {routerRedux} from 'dva/router'
import * as moduleService from '../services/module'
import pathToRegexp from 'path-to-regexp'

export default {
  namespace: 'module',
  state: {
    moduleList: [],
    currentModuleId: null,
    showModal: false,
  },
  reducers: {
    updateState(state, {payload}) {
      return {...state, ...payload}
    },

    addModule(state, {payload}) {
      const moduleList = state.moduleList
      moduleList.push(payload.module)
      return {
        ...state,
        moduleList
      }
    },

    updateModule(state, {payload}) {
      const moduleList = state.moduleList
      // for()
      let newModuleList = moduleList.map((module) => {
        if (module._id === payload.module._id) {
          return payload.module
        } else {
          return module
        }
      })
      return {
        ...state,
        moduleList: newModuleList
      }
    }

  },
  effects: {
    * fetchAll(action, {call, put}) {
      const {data: moduleList} = yield call(moduleService.fetchModuleList, {})
      yield put({type: 'updateState', payload: {moduleList}})
    },

    * create(action, {call, put, select}) {
      const user_ID = yield select(state => state.login.user.user_ID)

      const {data: module} = yield call(moduleService.createModule,
        {
          ...action.payload,
          user_ID
        })
      // 添加
      yield put({type: 'addModule', payload: {module}})
      // 跳转到页面
      console.log("module", module)
      yield put(routerRedux.push('/modulelist/' + module._id))
    },

    * update(action, {call, put, select}) {
      const {data: module} = yield call(moduleService.createModule, action.payload)
      yield put({type: "updateModule", payload: {module}})
    }
  },
  subscriptions: {
    // 当进入该页面是 获取用户所有 Models
    setup({dispatch, history}) {
      return history.listen(({pathname}) => {
        const match = pathToRegexp('/modulelist/:moduleId').exec(pathname)
        if (pathname === '/modulelist') {
          dispatch({
            type: 'fetchAll',
            payload: {}
          })
        }
        else if (pathname === '/profile'){
          dispatch({
            type: 'fetchAll',
            payload: {}
          })
        }
        else if (match) {
          dispatch({
            type: 'fetchAll',
            payload: {}
          })
          dispatch({type: 'updateState', payload: {currentModuleId: match[1]}})
        }
      })
    },
  }
}
