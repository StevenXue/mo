import React from 'react'
import {HashRouter, Route, Switch, Link, withRouter, routerRedux} from 'dva/router'
import {Breadcrumb} from 'antd'
import {connect} from 'dva'
import dynamic from 'dva/dynamic';
import pathToRegexp from 'path-to-regexp'
import {get} from 'lodash'

import NewPassword from './routes/login/NewPassword'
import Account from './routes/login/Account'
import MainLayout from './components/MainLayout/MainLayout'
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

const RouterConfig = ({history, location, projectDetail, app}) => {
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
              style={{textTransform: 'capitalize'}}>
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
    models: () => [import('./models/modelling')],
    component: () => import('./routes/workspace/info/ProjectDetail'),
  });

  const HomePage = dynamic({
    app,
    // models: () => [import('./models/launchpage')],
    component: () => import('./routes/HomePage'),
  });

  const routes = [
    {
      path: '/workspace/:projectId',
      models: () => [import('./models/modelling')],
      component: () => import('./routes/workspace/info/ProjectDetail'),
    }, {
      path: '/workspace',
      // models: () => [import('./models/dashboard')],
      component: () => import('./routes/workspace/info/Projects'),
    }
  ]

  const routes2 = [
    {
      path: '/explore',
      // models: () => [import('./models/modelling')],
      component: () => import('./routes/market/ProjectList'),
    },{
      path: '/userrequest/:userrequestId',
      // models: () => [import('./models/allRequest')],
      component: () => import('./routes/UserRequest/UserRequestDetail'),
    },{
      path: '/userrequest',
      // models: () => [import('./models/allRequest')],
      component: () => import('./routes/UserRequest/UserRequestList'),
    },{
      path: '/profile/:userId',
      // models: () => [
      //   import('./models/profile'),
      //   import('./models/login'),
      // ],
      component: () => import('./routes/Profile'),
    },{
      path: '/setting/profile/:userId',
      // models: () => [
      //   import('./models/profile'),
      //   import('./models/login'),
      // ],
      component: () => import('./routes/UserInfo'),
    },
  ]

  return (
    <div>
      <MainLayout location={location} history={history}>
    <Switch>

      <Route path="/user" component={Account}/>
      <Route path="/newpassword" component={NewPassword}/>
      <Route path="/:anything" component={() =>

          <div style={{display: 'flex', flexDirection: 'column'}}>
            {/*<Breadcrumb>*/}
              {/*{extraBreadcrumbItems}*/}
            {/*</Breadcrumb>*/}
            <Switch>
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
              <Route path="/explore/:projectId" render={(props) => <ProjectDetail {...props} market_use={true}/>}/>
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
          </div>
        }
      />
      <Route path="/" component={HomePage}/>
    </Switch>
      </MainLayout>
    </div>
  )
}

const Main = withRouter(connect(({projectDetail}) => ({projectDetail}))(RouterConfig))

const App = ((props) =>
    <HashRouter>
      <Main/>
    </HashRouter>
)

export default App
