import React from 'react'
import {connect} from 'dva'
import {Card, Tabs, Icon} from 'antd'

const TabPane = Tabs.TabPane
const {Meta} = Card
import ModuleListComp from '../../components/ModuleList/ModuleList'
import AddModuleModal from "../../components/AddModuleModal"
import styles from './index.less'

function callback(key) {
  console.log(key)
}


function ProfileTabPane({user, moduleList, dispatch, addOnClick}) {
  const {age, email, name, phone, user_ID} = user

  return (
    <div>
    <div className={styles.module_panel}>
      <div className={styles.card}>
        <Icon type="user" style={{ fontSize: 56, color: '#08c',  }}/>

        <p>user_ID: {user_ID}</p>
        <p>{"("} <Icon type="star" />{"30)"}</p>
        <p>name: {name}</p>
        <p>email: {email}</p>
        <p>phone: {phone}</p>
      </div>

      <Card title={"add module"} style={{width: 300}}
            onClick={addOnClick}
      >
        <p>add module for developer</p>
      </Card>

    </div>

      <ModuleListComp moduleList={moduleList} dispatch={dispatch}/>
    </div>
  )
}


function Profile({login, module, dispatch}) {
  const {showModal} = module

  const addModuleOnClick = () => dispatch({
    type: 'module/updateState',
    payload: {
      showModal: true
    }
  })

  if (login.user) {
    const {age, email, name, phone, user_ID} = login.user

    const moduleList = module.moduleList.filter((module) => module.user === login.user._id)

    return (
      <div className={styles.container}>

        <Tabs className={styles.tabs} defaultActiveKey="1" onChange={callback}>
          <TabPane tab="Module" key="1">
            <ProfileTabPane user={login.user} moduleList={moduleList}
                            addOnClick={addModuleOnClick} dispatch={dispatch}/>
          </TabPane>

          <TabPane tab="Service" key="2">

          </TabPane>
        </Tabs>

        <AddModuleModal dispatch={dispatch} visible={showModal}/>
      </div>
    )


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
