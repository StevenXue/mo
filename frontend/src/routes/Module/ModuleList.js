import React from 'react'
import {connect} from 'dva'

import ModuleListComp from '../../components/ModuleList/ModuleList'

function ModuleList({module, dispatch}) {
  return <ModuleListComp moduleList={module.moduleList} dispatch={dispatch}/>
}

export default connect(({module}) => ({module}))(ModuleList)
