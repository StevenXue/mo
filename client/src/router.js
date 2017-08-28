import React from 'react'
import PropTypes from 'prop-types';
import { Router } from 'dva/router';
import App from './routes/app';

const registerModel = (app, model) => {
  if (!(app._models.filter(m => m.namespace === model.namespace).length === 1)) {
    app.model(model)
  }
}

const Routers = function ({ history, app }) {
  const routes = [
    {
      path: '/',
      component: App,
      getIndexRoute (nextState, cb) {
        require.ensure([], require => {
          registerModel(app, require('./models/project'))
          cb(null, { component: require('./routes/project/') })
        }, 'dashboard')
      },
      childRoutes: [
        {
          path: 'upload',
          getComponent (nextState, cb) {
            require.ensure([], require => {
              registerModel(app, require('./models/upload'))
              cb(null, require('./routes/upload/'))
            }, 'upload')
          },
        },
        {
          path: 'project',
          getComponent (nextState, cb) {
            require.ensure([], require => {
              registerModel(app, require('./models/project'))
              cb(null, require('./routes/project/'))
            }, 'project')
          },
        },
        {
          path: 'project/:name',
          getComponent (nextState, cb) {
            require.ensure([], require => {
              registerModel(app, require('./models/project'))
              // registerModel(app, require('./models/predict'))
              // registerModel(app, require('./models/predictImage'))
              cb(null, require('./routes/project/components/detail'))
            }, 'project')
          },
        },
        {
          path: 'serving',
          getComponent (nextState, cb) {
            require.ensure([], require => {
              registerModel(app, require('./models/serving'))
              cb(null, require('./routes/serving/'))
            }, 'serving')
          },
        },
        {
          path: 'serving/:id',
          getComponent (nextState, cb) {
            require.ensure([], require => {
              registerModel(app, require('./models/serving'))
              cb(null, require('./routes/serving/components/modelDetail'))
            }, 'serving')
          },
        },
        // {
        //   path: 'user',
        //   getComponent (nextState, cb) {
        //     require.ensure([], require => {
        //       registerModel(app, require('./models/user'))
        //       cb(null, require('./routes/user/'))
        //     }, 'user')
        //   },
        // },
        {
          path: 'user/:id',
          getComponent (nextState, cb) {
            require.ensure([], require => {
              registerModel(app, require('./models/user/detail'))
              cb(null, require('./routes/user/detail/'))
            }, 'user-detail')
          },
        }, {
          path: 'login',
          getComponent (nextState, cb) {
            require.ensure([], require => {
              registerModel(app, require('./models/login'))
              cb(null, require('./routes/login/'))
            }, 'login')
          },
        }, {
          path: 'playground',
          getComponent (nextState, cb) {
            require.ensure([], require => {
              registerModel(app, require('./models/playground'))
              cb(null, require('./routes/playground/'))
            }, 'playground')
          },
        },
        // {
        //   path: 'request',
        //   getComponent (nextState, cb) {
        //     require.ensure([], require => {
        //       cb(null, require('./routes/request/'))
        //     }, 'request')
        //   },
        // },
        {
          path: '*',
          getComponent (nextState, cb) {
            require.ensure([], require => {
              cb(null, require('./routes/error/'))
            }, 'error')
          },
        },
      ],
    },
  ]

  return <Router history={history} routes={routes} />
}

Routers.propTypes = {
  history: PropTypes.object,
  app: PropTypes.object,
}

export default Routers
