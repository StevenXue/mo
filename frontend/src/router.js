import React from 'react'
import { HashRouter, Route, Switch } from 'dva/router'
import IndexPage from './routes/IndexPage'

import Users from './routes/Users.js'
import Login from './routes/Login'
import Projects from './routes/Projects'
import ProjectDetail from './routes/ProjectDetail'

import DataAnalysis from './routes/DataAnalysis/DataAnalysis'

import MainLayout from './components/MainLayout/MainLayout'

function RouterConfig({ history, location }) {
  return (
    <HashRouter>
      <MainLayout location={location}>
        <Switch>
          <Route path="/" exact component={Users}/>
          <Route path="/login" component={Login}/>
          <Route path="/projects/:projectID" component={ProjectDetail}/>
          <Route path="/projects" component={Projects}/>
          <Route path="/DataAnalysis" component={DataAnalysis}/>
        </Switch>
      </MainLayout>
    </HashRouter>
  )
}

export default RouterConfig
