import React from 'react'
import {HashRouter, Route, Switch, Link, withRouter, routerRedux} from 'dva/router'
import {Breadcrumb} from 'antd'
import {connect} from 'dva'
import pathToRegexp from 'path-to-regexp'
import {get} from 'lodash'

import Users from './routes/Users.js'
import Account from './routes/login/Account'
import MyProjects from './routes/workspace/info/Projects'
import Projects from './routes/projects/Projects'
import ProjectDetail from './routes/workspace/info/ProjectDetail'
import PublicProject from './routes/projects/PublicProject'
import MainLayout from './components/MainLayout/MainLayout'
import PublicServedModels from './routes/DeployedModels/ModelsList'
import PublicServedModelsDetail from './routes/DeployedModels/ModelsDetail'
import UserRequest from './routes/UserRequest/UserRequestList'
import UserRequestDetail from './routes/UserRequest/UserRequestDetail'
import MyService from './routes/MyService'
import {ModuleList, Module} from './routes/Module'
import Profile from './routes/Profile'
import MarketList from './routes/market/ProjectList'
import HomePage from './routes/HomePage'
// import MarketDetail from './routes/market/ProjectDetail'
// import ApiList from './components/Chat/ApiList'
const breadcrumbNameMap = {
  '/user': 'User',
  '/user/login': 'Login',
  '/user/register': 'Register',
  '/workspace': 'My Projects',
  '/projects': 'Projects',
  '/modelmarket': 'Model Market',
  '/myservice': 'My Service',
  '/userrequest': 'User Request',
  '/modellist': 'Module',
  '/profile': 'Profile',
  '/market': 'Market',
}

const RouterConfig = ({history, location, projectDetail}) => {
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

  return (
    <Switch>
      <Route path="/user" component={Account}/>

      <Route path="/:anything" component={() =>
        <MainLayout location={location} history={history}>
          <div style={{display: 'flex', flexDirection: 'column'}}>
            <Breadcrumb>
              {extraBreadcrumbItems}
            </Breadcrumb>
            <Switch>

              <Route path="/workspace/:projectId" component={ProjectDetail}/>
              <Route path="/workspace" component={MyProjects}/>
              <Route path="/projects/:projectId" component={PublicProject}/>
              <Route path="/projects" component={Projects}/>

              <Route path="/market/:projectId" render={(props) => <ProjectDetail {...props} market_use={true}/>}/>
              <Route path="/market" component={MarketList}/>

              <Route path="/modelmarket/:modelsId" component={PublicServedModelsDetail}/>
              <Route path="/modelmarket" component={PublicServedModels}/>
              <Route path="/myservice" component={MyService}/>
              <Route path="/userrequest/:userrequestId" component={UserRequestDetail}/>
              <Route path="/userrequest" component={UserRequest}/>

              <Route path="/modulelist/:moduleId" component={Module}/>
              <Route path="/modulelist" component={ModuleList}/>
              <Route path="/profile/:userId" component={Profile}/>
            </Switch>
          </div>
        </MainLayout>}
      />


      <Route path="/" component={HomePage}/>



    </Switch>
  )
}

const Main = withRouter(connect(({projectDetail}) => ({projectDetail}))(RouterConfig))

const App = ((props) =>
    <HashRouter>
      <Main/>
    </HashRouter>
)

export default App
