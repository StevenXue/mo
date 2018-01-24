import {routerRedux} from 'dva/router'
import * as moduleService from '../services/module'
import pathToRegexp from 'path-to-regexp'

export default {
  namespace: 'module',
  state: {
    moduleList: [],
    currentModuleId: null,
    showModal: false
  },
  reducers: {
    updateState(state, {payload}) {
      return {...state, ...payload}
    },


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
      // 跳转到页面
      console.log("module", module)
      yield put(routerRedux.push('/modulelist/' + module._id))
    },
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
        } else if (match) {
          dispatch({type: 'updateState', payload: {currentModuleId: match[1]}})
        }
      })
    },
  }
}
