import {twoStepVFC} from '../services/user'
import {sendCaptchaToEmail} from '../services/user'
import { routerRedux } from 'dva/router'
import { message } from 'antd'
import pathToRegexp from 'path-to-regexp'
import io from 'socket.io-client'
import { invert } from 'lodash'

import { queryURL } from '../utils'
import * as projectService from '../services/project'
import * as userService from '../services/user'
import { flaskServer, translateDict } from '../constants'
import * as userRequestService from "../services/userRequest"


export default {
  namespace: 'profile',
  state: {
    projectNumber: false,
  },
  reducers: {
    updateProjectNumber(state, action){
      console.log('action',action)
      return{
        ...state,
        projectNumber:action.payload.projectNumber,
      }
    },
    setUserInfo(state, {userInfo}){
      return{
        ...state,
        userInfo
      }
    },

  },
  effects: {
    * fetchUserInfo(action, {call, put, select}){
      const {data: userInfo} = yield call(userService.getUserInfo, {user_ID:action.payload.user_ID})
      yield put({
        type: 'setUserInfo',
        userInfo
      })
    },
    * fetchProjectNumber(action, {call, put, select}){
      const {data: projectNumber} = yield call(projectService.countProjects, {user_ID:action.payload.user_ID})
      yield put({
        type: 'updateProjectNumber',
        payload: {projectNumber: projectNumber}
      })
    },

    *sendCaptchaToEmail({ payload }, { put, call }){
      const response = yield call(sendCaptchaToEmail, payload)
      console.log("response", response)
      if(response.status === 200){
        message.success('验证码发送成功!')
      }else{
        let errorMessage = response.data.error.message
        message.error(errorMessage)
      }
    },

    * twoStepVFC({ payload }, { put, call }) {
      const response = yield call(twoStepVFC, payload)
      if (response.status === 200) {
        const { data } = response
        if (data) {
          localStorage.setItem('tokenForUpdateInfo', data.tokenForUpdateInfo)
        } else {
          throw data
        }
      } else {
        let errorMessage = response.data.error.message
        message.error(errorMessage)
      }
    },
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname }) => {
        const match = pathToRegexp('/profile/:userId').exec(pathname)
        const match2 = pathToRegexp('/setting/profile/:userId').exec(pathname)
        if (match2) {
          console.log(match2)
          dispatch({
            type: 'fetchUserInfo',
            payload: {user_ID: match2[1]}
          })}
        if (match) {
          dispatch({
            type: 'fetchUserInfo',
            payload: {user_ID: match[1]}
          })
          dispatch({
            type: 'fetchProjectNumber',
            payload: {user_ID: match[1]}
          })
        }
      })
    },
  },
}

