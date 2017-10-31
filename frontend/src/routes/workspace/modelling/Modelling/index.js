import React from 'react';
import {connect} from 'dva';

import Common from '../../common/Common/index'



function Modelling({location, dispatch, modelling}) {
  const props = {
    model: modelling,
    namespace: 'modelling',
    dispatch:  dispatch,
    step: 'model'
  };
  return (
    <Common {...props}/>
  );
}

export default connect(({modelling}) => ({modelling}))(Modelling);
