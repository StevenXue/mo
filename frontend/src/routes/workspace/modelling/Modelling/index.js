import React from 'react';
import {connect} from 'dva';

import Common from '../../common/Common/index'
import Guidance from '../../dataAnalysis/Guidance'


function Modelling({location, dispatch, modelling}) {
  const props = {
    model: modelling,
    namespace: 'modelling',
    dispatch: dispatch,
    step: 'model'
  };

  const {
    showGuidance
  } = modelling;

  return (
    showGuidance ?
      <Guidance {...props}/> :
      <Common {...props}/>
  );
}

export default connect(({modelling}) => ({modelling}))(Modelling);
