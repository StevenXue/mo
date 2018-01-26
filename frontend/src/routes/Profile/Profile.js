import React from 'react'
import {connect} from 'dva'
// import styles from './index.less'
import {Card} from 'antd'
import ModuleListComp from '../../components/ModuleList/ModuleList'
import AddModuleModal from "../../components/AddModuleModal"


const {Meta} = Card


function Profile({login, module, dispatch}) {
  const {showModal} = module

  if (login.user) {
    const {age, email, name, phone, user_ID} = login.user

    const moduleList = module.moduleList.filter((module) => module.user === login.user._id)

    return (
      <div>
        <div style={{display: "flex", flexDirection: "row"}}>
          <Card title={name} extra={<a href="#">Edit</a>} style={{width: 300}}>
            <p>{email}</p>
            <p>{age}</p>
            <p>{phone}</p>
          </Card>

          <Card title={"add module"} style={{width: 300}}
                onClick={() => dispatch({
                  type: 'module/updateState',
                  payload: {
                    showModal: true
                  }
                })}
          >
            <p>add module for developer</p>
          </Card>

          <Card title={"add service"} style={{width: 300}}>
            <p>add service for user</p>
          </Card>

        </div>
        <ModuleListComp moduleList={moduleList} dispatch={dispatch}/>

        <AddModuleModal dispatch={dispatch} visible={showModal}/>
      </div>
    )
  }
  else {
    return <div/>
  }
}

export default connect(({login, module}) => ({login, module}))(Profile)
