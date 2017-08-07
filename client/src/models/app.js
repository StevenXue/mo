import React from 'react'
import { query, logout } from '../services/app'
import { routerRedux } from 'dva/router'
import { parse } from 'qs'
import { queryURL } from '../utils'
import { config } from '../utils'
const { prefix } = config


let joyRide = {
  joyride: undefined,
  joyrideOverlay: true,
  joyrideType: 'continuous',
  isRunning: false,
  stepIndex: 0,
  steps: [],
}

export default {
  namespace: 'app',
  state: {
    user: {},
    menuPopoverVisible: false,
    siderFold: localStorage.getItem(`${prefix}siderFold`) === 'true',
    darkTheme: localStorage.getItem(`${prefix}darkTheme`) === 'true',
    isNavbar: document.body.clientWidth < 769,
    navOpenKeys: JSON.parse(localStorage.getItem(`${prefix}navOpenKeys`)) || [],
    ...joyRide
  },
  subscriptions: {

    setup ({ dispatch }) {
      dispatch({ type: 'query' })
      let tid
      window.onresize = () => {
        clearTimeout(tid)
        tid = setTimeout(() => {
          dispatch({ type: 'changeNavbar' })
        }, 300)
      }
    },

  },
  effects: {

    *query ({
      payload,
    }, { call, put }) {
      const data = yield call(query, parse(payload))
      // const user = yield select(state => state['app'].user);
      // data['user'] = user
      if (data.success && data.user) {
        yield put({
          type: 'querySuccess',
          payload: data.user,
        })
        const from = queryURL('from')
        if (from) {
          yield put(routerRedux.push(from))
        }
        if (location.pathname === '/login') {
          // user dashboard not build yet, push to project by default
          yield put(routerRedux.push('/project'))
        }
      } else {
        if (location.pathname !== '/login') {
          let from = location.pathname
          if (location.pathname === '/dashboard') {
            from = '/dashboard'
          }
          window.location = `${location.origin}/login?from=${from}`
        }
      }
    },

    *logout ({
      payload,
    }, { call, put }) {
      localStorage.clear()
      yield put(routerRedux.push('/login'))
      // const data = yield call(logout, parse(payload))
      // if (data.success) {
      //   yield put({ type: 'query' })
      // } else {
      //   throw (data)
      // }
    },

    *changeNavbar ({
      payload,
    }, { put, select }) {
      const { app } = yield(select(_ => _))
      const isNavbar = document.body.clientWidth < 769
      if (isNavbar !== app.isNavbar) {
        yield put({ type: 'handleNavbar', payload: isNavbar })
      }
    },

    *resetJoyride ({
                     payload,
                   }, { put, select }) {
      const { app } = yield(select(_ => _))
      app.joyride.reset(true)
    },

    *resetAndRun ({
                    payload,
                  }, { put, select }) {
      yield put({ type: 'resetJoyride' })
      yield put({ type: 'setSetps', payload })
      yield put({ type: 'runTour' })
    },

  },
  reducers: {

    runTour (state) {
      return {
        ...state,
        isRunning: true
      }
    },

    addSteps (state, { payload: steps }) {
      let newSteps = steps
      if (!Array.isArray(newSteps)) {
        newSteps = [newSteps]
      }

      if (!newSteps.length) {
        return
      }

      state.steps = state.steps.concat(newSteps)
      return state
    },

    setSetps (state, { payload: steps }) {
      let newSteps = steps
      if (!Array.isArray(newSteps)) {
        newSteps = [newSteps]
      }

      if (!newSteps.length) {
        return
      }

      state.steps = newSteps
      return state
    },

    callback(state, { payload: data }) {
      // console.log('joyride callback', data);

      return {
        ...state,
        selector: data.type === 'tooltip:before' ? data.step.selector : ''
      }
    },

    querySuccess (state, { payload: user }) {
      return {
        ...state,
        user,
      }
    },

    switchSider (state) {
      localStorage.setItem(`${prefix}siderFold`, !state.siderFold)
      return {
        ...state,
        siderFold: !state.siderFold,
      }
    },

    switchTheme (state) {
      localStorage.setItem(`${prefix}darkTheme`, !state.darkTheme)
      return {
        ...state,
        darkTheme: !state.darkTheme,
      }
    },

    switchMenuPopver (state) {
      return {
        ...state,
        menuPopoverVisible: !state.menuPopoverVisible,
      }
    },

    handleNavbar (state, { payload }) {
      return {
        ...state,
        isNavbar: payload,
      }
    },

    handleNavOpenKeys (state, { payload: navOpenKeys }) {
      return {
        ...state,
        ...navOpenKeys,
      }
    },
  },
}
