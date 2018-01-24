import React from 'react'
import {connect} from 'dva'
import styles from './index.less'
import {Tabs, Switch, Button, Input, Form, Card} from 'antd'
import {get} from 'lodash'
import {showTime} from '../../utils/index'


function Modules({module, dispatch}) {
  const {
    currentModuleId,
    moduleList
  } = module

  const moduleDetail = moduleList.find(e => e._id === currentModuleId)
  return (
    moduleDetail ?
      <div className={`main-container ${styles.normal}`}>
        <h2
          style={{paddingBottom: 10}}>{get(moduleDetail, 'name', "名称")}
        </h2>

        <Card key={moduleDetail._id} title={get(moduleDetail, 'module_path', "路径")}>
          <div>
            <p>{get(moduleDetail, 'description', "描述")}</p>
            <p>{get(moduleDetail, 'create_time') ? showTime(get(moduleDetail, 'create_time')) : '时间'}</p>
            <p>{get(moduleDetail, 'user', "创建者")}</p>
          </div>
        </Card>

        <Card key={moduleDetail._id + "1"} title={"Example"}>
          <div>
            <p>{get(moduleDetail, 'input', "输入")}</p>
            <p>{get(moduleDetail, 'output', "输出")}</p>
          </div>
        </Card>
      </div> : null
  )
}

export default connect(({module}) => ({module}))(Modules)
