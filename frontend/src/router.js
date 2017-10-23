import React from 'react'
import {HashRouter, Route, Switch, Link, withRouter} from 'dva/router'
import {Breadcrumb} from 'antd'
import pathToRegexp from 'path-to-regexp';

import Users from './routes/Users.js'
import Login from './routes/Login'
import Projects from './routes/Projects'
import ProjectDetail from './routes/ProjectDetail'
import MainLayout from './components/MainLayout/MainLayout'

const breadcrumbNameMap = {
  '/login': 'Login',
  '/projects': 'Project List',
};

const RouterConfig = withRouter(({history, location}) => {
  const pathSnippets = location.pathname.split('/').filter(i => i);
  const extraBreadcrumbItems = pathSnippets.map((_, index) => {
    const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
    let breadcrumbName;
    const matchDetail = pathToRegexp('/projects/:projectId').exec(url);
    const matchPro = pathToRegexp('/projects/:projectId/:step').exec(url);
    if (matchDetail) {
      breadcrumbName = `Project Info`
    } else if (matchPro) {
      breadcrumbName = matchPro[2]
    }
    return (
      <Breadcrumb.Item key={url}>
        <Link to={url} style={{textTransform: 'capitalize'}}>
          {breadcrumbName || breadcrumbNameMap[url]}
        </Link>
      </Breadcrumb.Item>
    );
  });
  const breadcrumbItems = [(
    <Breadcrumb.Item key="home">
      <Link to="/">Home</Link>
    </Breadcrumb.Item>
  )].concat(extraBreadcrumbItems);

  return (
    <MainLayout location={location}>
      <div style={{display: 'flex', flexDirection: 'column'}}>
        <Breadcrumb>
          {breadcrumbItems}
        </Breadcrumb>
        <Switch>
          <Route path="/" exact component={Users}/>
          <Route path="/login" component={Login}/>
          <Route path="/projects/:projectId" component={ProjectDetail}/>
          <Route path="/projects" component={Projects}/>
        </Switch>
      </div>
    </MainLayout>
  )
});

const App = ((props) =>
  <HashRouter>
    <RouterConfig/>
  </HashRouter>
)

export default App
