import React from 'react';
import {connect} from 'dva';
import Common from '../../common/Common/index'

function DataAnalysis({location, dispatch, dataAnalysis}) {
  const props = {
    model: dataAnalysis,
    namespace: 'dataAnalysis',
    dispatch: dispatch,
    step: 'toolkit'
  };
  return (
    <Common {...props}/>
  );
}


export default connect(({dataAnalysis}) => ({dataAnalysis}))(DataAnalysis);
