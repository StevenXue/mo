import {login, tokenLogin, loginWithPhone} from '../services/login'
import {routerRedux} from 'dva/router'
import {message} from 'antd'
import pathToRegexp from 'path-to-regexp'
import io from 'socket.io-client'
import {invert} from 'lodash'

import {queryURL} from '../utils'
import * as projectService from '../services/project'
import {flaskServer, translateDict} from '../constants'
import * as userRequestService from '../services/userRequest'

let connected = false

export default {
  namespace: 'login',
  state: {
    loginLoading: false,
  },
  reducers: {
    changeLoginStatus(state, {payload}) {
      return {
        ...state,
        status: payload.status,
        type: payload.type,
      }
    },
    changeSubmitting(state, {payload}) {
      return {
        ...state,
        submitting: payload,
      }
    },
    showLoginLoading(state) {
      return {
        ...state,
        loginLoading: true,
      }
    },
    hideLoginLoading(state) {
      return {
        ...state,
        loginLoading: false,
      }
    },
    setUser(state, {payload: user}) {
      return {
        ...state,
        user,
      }
    },
    resetUser(state, {payload: user}) {
      return {
        ...state,
        user: undefined,
      }
    },
    updateProjectNumber(state, action) {
      console.log('action', action)
      return {
        ...state,
        user: {
          ...state.user,
          projectNumber: action.payload.projectNumber,
        },
      }
    },
    setUserAvatar(state, {userAvatar}) {
      console.log('userAvatar', userAvatar)
      return {
        ...state,
        userAvatar
      }
    }
  },
  effects: {
    * accountSubmit({payload}, {call, put}) {
      yield put({
        type: 'changeSubmitting',
        payload: true,
      })
      const response = yield call(fakeAccountLogin, payload)
      yield put({
        type: 'changeLoginStatus',
        payload: response,
      })
      yield put({
        type: 'changeSubmitting',
        payload: false,
      })
    },
    * mobileSubmit(_, {call, put}) {
      yield put({
        type: 'changeSubmitting',
        payload: true,
      })
      const response = yield call(fakeMobileLogin)
      yield put({
        type: 'changeLoginStatus',
        payload: response,
      })
      yield put({
        type: 'changeSubmitting',
        payload: false,
      })
    },
    * logout(_, {put}) {
      yield put({
        type: 'changeLoginStatus',
        payload: {
          status: false,
        },
      })
      yield put(routerRedux.push('/user/login'))
    },
    * login({payload}, {put, call}) {
      yield put({
        type: 'changeSubmitting',
        payload: true,
      })
      const {data: data, noError} = yield call(login, payload)
      yield put({
        type: 'changeSubmitting',
        payload: false,
      })

      if (data && noError) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user_ID', data.user.user_ID)
        localStorage.setItem('user_obj_id', data.user._id)
        const from = queryURL('from')
        yield put({type: 'setUser', payload: data.user})
        yield put({
          type: 'setUserAvatar',
          userAvatar: `/pyapi/user/avatar/${data.user.user_ID}.jpeg?${new Date().getTime()}`
        })
        if (from) {
          yield put(routerRedux.push(from))
        } else {
          yield put(routerRedux.push('/launchpage'))
        }
      } else {
        throw data
      }
    },

    * loginWithPhone({payload}, {put, call}) {
      yield put({
        type: 'changeSubmitting',
        payload: true,
      })
      const response = yield call(loginWithPhone, payload)
      yield put({
        type: 'changeSubmitting',
        payload: false,
      })

      if (response.status === 200) {
        const {data} = response
        if (data) {
          localStorage.setItem('token', data.token)
          localStorage.setItem('user_ID', data.user.user_ID)
          localStorage.setItem('user_obj_id', data.user._id)
          const from = queryURL('from')
          yield put({type: 'setUser', payload: data.user})
          yield put({
            type: 'setUserAvatar',
            userAvatar: `/pyapi/user/avatar/${data.user.user_ID}.jpeg?${new Date().getTime()}`
          })
          if (from) {
            yield put(routerRedux.push(from))
          } else {
            yield put(routerRedux.push('/userrequest?tab=app'))
          }
        } else {
          throw data
        }
      } else {
        let errorMessage = response.data.error.message
        message.error(errorMessage)
      }
    },
    * query({payload}, {call, put}) {
      try {
        const {data: data} = yield call(tokenLogin)
        if (!data.user) {
          if (!(location.href.includes('/user/login') || location.href.includes('/user/forgot') || location.href.includes('/newpassword') || location.href.includes('/user/register') || location.href.slice(-3) === '/#/')) {
            // yield put(routerRedux.push('/user/login'))
            // FIXME reload is a workaround
            window.location.replace('/#/user/login')
            window.location.reload()
          }
        } else {
          yield put({
            type: 'setUser',
            payload: data.user,
          })
          yield put({
            type: 'setUserAvatar',
            userAvatar: `/pyapi/user/avatar/${data.user.user_ID}.jpeg?${new Date().getTime()}`
          })
          // FIXME regex can't catch whole url
          // const from = queryURL('from')
          // if (from) {
          //   yield put(routerRedux.push(from))
          // }
          console.log(location.hash.substr(1))
          if (location.hash.substr(1) === '/login') {
            // user dashboard not build yet, push to project by default
            yield put(routerRedux.push('/workspace?tab=app'))
          }
        }
      } catch (err) {
        if (!(location.href.includes('/user/login') || location.href.includes('/user/register'))) {
          let from = location.pathname
          // window.location = `${location.origin}/login?from=${from}`
          // window.location = `${location.origin}/#/login`
          yield put(routerRedux.push('/user/login'))
        }
      }
    },
    * handleSocket({payload}, {call, put}) {
      const {msg, pathname} = payload
      const projectIdMsg = msg.project_id
      const jobIdMsg = msg.job_id
      const match = pathToRegexp('/workspace/:projectId*').exec(pathname)
      if (match) {
        const projectId = match[1]
        if (projectId === projectIdMsg) {

          // in project
          yield put({
            type: 'modelling/setMetrics',
            payload: {msg},
          })
        }
      }
    },
    * handleError({payload}, {call, put}) {
      const {msg, pathname} = payload
      const projectIdMsg = msg.project_id
      const jobIdMsg = msg.job_id
      message.error(JSON.stringify(msg))
      yield put({type: 'modelling/hideResult'})
      yield put({
        type: invert(translateDict)[msg.type] + '/setStatus', payload: {
          sectionId: jobIdMsg,
          status: 300,
        },
      })
      console.log(' '.join(msg.error))
      // console.log(msg.error)
    },
    * handleSuccess({payload}, {call, put}) {
      const {msg, pathname} = payload
      const projectIdMsg = msg.project_id
      const jobIdMsg = msg.job_id
      message.success(msg.content)
      if (msg.complete) {
        // set job state to complete
        yield put({
          type: invert(translateDict)[msg.type] + '/setStatus', payload: {
            sectionId: jobIdMsg,
            status: 200,
          },
        })
      }
    },
  },
  subscriptions: {
    setup({dispatch, history}) {
      return history.listen(({pathname}) => {
        console.log('pathname', pathname)
        const match = pathToRegexp('/user/login').exec(pathname)

        if (!match) {
          dispatch({type: 'query'})
        }

        const userId = localStorage.getItem('user_ID')
        if (userId && !connected) {

          const socket = io.connect('/log/' + userId, {path: '/socketio/socket.io'})
          socket.on('log_epoch_end', (msg) => {
            dispatch({type: 'handleSocket', payload: {msg, pathname}})
          })
          socket.on('error', (msg) => {
            dispatch({type: 'handleError', payload: {msg, pathname}})
          })
          socket.on('success', (msg) => {
            dispatch({type: 'handleSuccess', payload: {msg, pathname}})
          })

          socket.on('notification', (msg) => {
            if (msg.message.message_type !== 'deploy') {
              dispatch({type: 'message/updateNewMessage', payload: {msg}})
            }
            console.log('msg', msg)
            if (msg.message.message_type === 'deploy' || msg.message.message_type === 'publish') {
              const match = pathToRegexp('/workspace/:projectId/:type?').exec(pathname)
              if (match) {
                const projectId = match[1]
                const url = new URL(location.href.replace('/#', ''))
                const projectType = url.searchParams.get('type') || match[2]
                dispatch({
                  type: 'projectDetail/refresh',
                  projectId,
                  projectType
                })
              }
            }
          })
          connected = true
        }
      })
    },
  },
}

