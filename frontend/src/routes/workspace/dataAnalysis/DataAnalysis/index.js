import React from 'react';
import {connect} from 'dva';
import {Button} from 'antd'

import Common from '../../common/Common/index'
import Guidance from '../Guidance'

function DataAnalysis({location, dispatch, dataAnalysis}) {
  const props = {
    model: dataAnalysis,
    namespace: 'dataAnalysis',
    dispatch: dispatch,
    step: 'toolkit'
  };

  const {
    showGuidance
  } = dataAnalysis;

  return (
    <Common {...props}/>
  );
}


export default connect(({dataAnalysis}) => ({dataAnalysis}))(DataAnalysis);
