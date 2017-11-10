import React from 'react'
import { HashRouter, Route, Switch, Link, withRouter, routerRedux } from 'dva/router'
import { Breadcrumb } from 'antd'
import { connect } from 'dva'
import pathToRegexp from 'path-to-regexp'
import {get} from 'lodash'

import Users from './routes/Users.js'
import Account from './routes/login/Account'
import MyProjects from './routes/workspace/info/Projects'
import Projects from './routes/projects/Projects'
import ProjectDetail from './routes/workspace/info/ProjectDetail'
import MainLayout from './components/MainLayout/MainLayout'
import PublicServedModels from  './routes/DeployedModels/ModelsList'
import  PublicServedModelsDetail from  './routes/DeployedModels/ModelsDetail'

const breadcrumbNameMap = {
  '/user': 'User',
  '/user/login': 'Login',
  '/user/register': 'Register',
  '/workspace': 'My Projects',
  '/projects': 'Projects',
  '/modelmarkets': 'Model Markets',
}

const RouterConfig = ({ history, location, projectDetail }) => {
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
          <Route path="/user" component={Account}/>
          <Route path="/workspace/:projectId" component={ProjectDetail}/>
          <Route path="/workspace" component={MyProjects}/>
          <Route path="/projects" component={Projects}/>
          <Route path="/modelmarkets/:modelsId" component={PublicServedModelsDetail}/>
          <Route path="/modelmarkets" component={PublicServedModels}/>
        </Switch>
      </div>
    </MainLayout>
  )
}

const Main = withRouter(connect(({ projectDetail }) => ({ projectDetail }))(RouterConfig))

const App = ((props) =>
    <HashRouter>
      <Main/>
    </HashRouter>
)

export default App
