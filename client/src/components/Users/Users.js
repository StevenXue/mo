import React from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import styles from './Users.css';
import LoginPanel from './LoginPannel';

function Users({ dispatch }) {

  function login(values) {
    console.log('received', values);
    dispatch({
      type: 'users/login',
      payload: values,
    });
  }

  return (
    <div className={styles.normal}>
      <div style = {{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
        <LoginPanel loginToJupyter={login} />
      </div>
    </div>
  );
}

function mapStateToProps(state) {
  const {  } = state.users;
  return {
    loading: state.loading.models.users,
  };
}

export default connect(mapStateToProps)(Users);
