import React from 'react';
import { HashRouter, Route } from 'dva/router';
import IndexPage from './routes/IndexPage';

import Users from "./routes/Users.js";
import Login from "./routes/Login";
import Projects from "./routes/Projects";

import DataAnalysis from "./routes/DataAnalysis/DataAnalysis";

import MainLayout from './components/MainLayout/MainLayout'

function RouterConfig({ history, location }) {
  return (
    <HashRouter>
      <MainLayout location={location} >
        <Route path="/" exact component={Users} />
        <Route path="/login" component={Login} />
        <Route path="/projects" component={Projects} />
        <Route path="/DataAnalysis" component={DataAnalysis} />
        {/*<Route path="/app" component={App} />*/}
      </MainLayout>
    </HashRouter>
  );
}

export default RouterConfig;
