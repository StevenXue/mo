import React from 'react';
import { BrowserRouter, Route } from 'dva/router';
import IndexPage from './routes/IndexPage';

import Users from "./routes/Users.js";

import DataAnalysis from "./routes/DataAnalysis/DataAnalysis";

import MainLayout from './components/MainLayout/MainLayout'

function RouterConfig({ history, location }) {
  return (
    <BrowserRouter>
      <MainLayout location={location} >
        <Route path="/" exact component={Users} />
        <Route path="/DataAnalysis" component={DataAnalysis} />
        {/*<Route path="/app" component={App} />*/}
      </MainLayout>
    </BrowserRouter>
  );
}

export default RouterConfig;
