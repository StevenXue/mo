import React from 'react'
import { HashRouter, Route, Switch, Link, withRouter, routerRedux } from 'dva/router'
import { Breadcrumb, Modal } from 'antd'
import { connect } from 'dva'
import dynamic from 'dva/dynamic'
import pathToRegexp from 'path-to-regexp'
import { get } from 'lodash'

import NewPassword from './routes/login/NewPassword'
import Account from './routes/login/Account'
import MainLayout from './components/MainLayout/MainLayout'
// import ProjectDetail from './routes/workspace/ProjectDetail'
import modelling from './models/modelling';

const breadcrumbNameMap = {
  '/user': 'User',
  '/user/login': 'Login',
  '/user/register': 'Register',
  '/user/forgot': 'Forgot',
  // '/user/newpassword': 'NewPassword',
  '/workspace': 'My Projects',
  '/projects': 'Projects',
  '/modelmarket': 'Model Market',
  '/myservice': 'My Service',
  '/userrequest': 'User Request',
  '/modellist': 'Module',
  '/profile': 'Profile',
  '/explore': 'Explore',
}

const RouterConfig = ({ history, location, projectDetail, app }) => {
  const pathSnippets = location.pathname.split('/').filter(i => i)

  const extraBreadcrumbItems = pathSnippets.map((_, index) => {
    const url = `/${pathSnippets.slice(0, index + 1).join('/')}`
    let breadcrumbName
    const matchDetail = pathToRegexp('/workspace/:projectId').exec(url)
    const matchPro = pathToRegexp('/workspace/:projectId/:step').exec(url)
    const matchSubStep = pathToRegexp('/workspace/:projectId/:step/:subs').exec(url)
    if (matchDetail) {
      breadcrumbName = get(projectDetail, 'project.name', 'Project Info')
    } else if (matchPro) {
      breadcrumbName = matchPro[2]
    } else if (matchSubStep) {
      breadcrumbName = matchSubStep[3]
    }
    return (
      <Breadcrumb.Item key={url}>
        <Link to={url + location.search.replace('type', 'tab')}
              style={{ textTransform: 'capitalize' }}>
          {breadcrumbName || breadcrumbNameMap[url]}
        </Link>
      </Breadcrumb.Item>
    )
  })
  const breadcrumbItems = [(
    <Breadcrumb.Item key="home">
      <Link to="/">Home</Link>
    </Breadcrumb.Item>
  )].concat(extraBreadcrumbItems)

  const ProjectDetail = dynamic({
    app,
    models: () => [
      modelling
    ],
    component: () => import('./routes/workspace/ProjectDetail'),
  })

  const HomePage = dynamic({
    app,
    // models: () => [import('./models/launchpage')],
    component: () => import('./routes/HomePage'),
  })
  const LaunchPage = dynamic({
    app,
    // models: () => [import('./models/launchpage')],
    component: () => import('./components/MainLayout/LaunchPage.js'),
  })
  const routes = [
    {
      path: '/workspace',
      // models: () => [import('./models/dashboard')],
      component: () => import('./routes/workspace/Projects'),
    },
  ]

  const routes2 = [
    {
      path: '/explore',
      // models: () => [import('./models/modelling')],
      component: () => import('./routes/market/ProjectList'),
    },
   {
      path: '/userrequest/:userrequestId',
      models: () => [import('./models/allRequest')],
      component: () => import('./routes/UserRequest/UserRequestDetail'),
    }, {
      path: '/userrequest',
      models: () => [import('./models/allRequest')],
      component: () => import('./routes/UserRequest/UserRequestList'),
    }, {
      path: '/profile/:userId',
      models: () => [
        import('./models/profile'),
        import('./models/allRequest'),
        //   import('./models/login'),
      ],
      component: () => import('./routes/Profile'),
    }, {
      path: '/setting/profile/:userId',
      models: () => [
        import('./models/profile'),
        import('./models/allRequest'),
        //   import('./models/login'),
      ],
      component: () => import('./routes/UserInfo'),
    },
  ]
  return (
    <MainLayout location={location} history={history}>
      <Switch>
        <Route exact path="/" component={HomePage}/>
        {/*if has child routes move exact inside*/}
        <Route path="/user" component={Account}/>
        <Route exact path="/newpassword" component={NewPassword}/>
        {/*if has child routes move exact inside*/}
        <Route path="/workspace/:projectId" component={ProjectDetail}/>
        {
          routes.map(({ path, ...dynamics }, key) => (
            <Route key={key}
                   exact
                   path={path}
                   component={dynamic({
                     app,
                     ...dynamics,
                   })}
            />
          ))
        }
        {/*if has child routes move exact inside*/}
        <Route path="/explore/:projectId"
               component={ProjectDetail}/>
        <Route exact path="/launchpage" component={LaunchPage} location={location}/>
        {
          routes2.map(({ path, ...dynamics }, key) => (
            <Route key={key}
                   exact
                   path={path}
                   component={dynamic({
                     app,
                     ...dynamics,
                   })}
            />
          ))
        }

      </Switch>

    </MainLayout>
  )
}

const Main = withRouter(connect(({ projectDetail }) => ({ projectDetail }))(RouterConfig))

const App = ((props) => {
    return <HashRouter>
      <Main {...props}/>
    </HashRouter>
  }
)

export default App
