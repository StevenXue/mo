import React from 'react'
import { HashRouter, Route, Switch, Link, withRouter, routerRedux } from 'dva/router'
import { Breadcrumb } from 'antd'
import { connect } from 'dva'
import pathToRegexp from 'path-to-regexp'
import {get} from 'lodash'

import Users from './routes/Users.js'
import Login from './routes/login/Login'
import MyProjects from './routes/workspace/info/Projects'
import Projects from './routes/projects/Projects'
import ProjectDetail from './routes/workspace/info/ProjectDetail'
import MainLayout from './components/MainLayout/MainLayout'
const breadcrumbNameMap = {
  '/login': 'Login',
  '/workspace': 'My Projects',
  '/projects': 'Projects',
  '/deployed_models': 'Deployed Models',
}

const RouterConfig = ({ history, location, login, projectDetail }) => {
  const pathSnippets = location.pathname.split('/').filter(i => i)

  const extraBreadcrumbItems = pathSnippets.map((_, index) => {
    const url = `/${pathSnippets.slice(0, index + 1).join('/')}`
    let breadcrumbName
    const matchDetail = pathToRegexp('/workspace/:projectId').exec(url)
    const matchPro = pathToRegexp('/workspace/:projectId/:step').exec(url)
    const matchSubStep = pathToRegexp('/workspace/:projectId/:step/:subs').exec(url)
    if (matchDetail) {
      breadcrumbName = get(projectDetail, 'project.name', 'Project Info');
    } else if (matchPro) {
      breadcrumbName = matchPro[2]
    } else if (matchSubStep) {
      breadcrumbName = matchSubStep[3]
    }
    return (
      <Breadcrumb.Item key={url}>
        <Link to={url} style={{ textTransform: 'capitalize' }}>
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

  return (
    <MainLayout location={location} history={history}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <Breadcrumb>
          {breadcrumbItems}
        </Breadcrumb>
        <Switch>
          <Route path="/" exact component={Users}/>
          <Route path="/login" component={Login}/>
          <Route path="/workspace/:projectId" component={ProjectDetail}/>
          <Route path="/workspace" component={MyProjects}/>
          <Route path="/projects" component={Projects}/>
        </Switch>
      </div>
    </MainLayout>
  )
}

const Main = withRouter(connect(({ login, projectDetail }) => ({ login, projectDetail }))(RouterConfig))

const App = ((props) =>
    <HashRouter>
      <Main/>
    </HashRouter>
)

export default App
