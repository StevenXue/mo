import React from 'react';
import { Router, Route } from 'dva/router';
import IndexPage from './routes/IndexPage';

import Users from "./routes/Users.js";

import DataAnalysis from "./routes/DataAnalysis/DataAnalysis";

function RouterConfig({ history }) {
  return (

    <Router history={history}>
      <Route path="/" component={IndexPage} />
      <Route path="/users" component={Users} />
      <Route path="/DataAnalysis" component={DataAnalysis} />
    </Router>
  );
}

export default RouterConfig;
