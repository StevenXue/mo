import React, { Component } from 'react'
import { Modal, Input, Button, message } from 'antd'
import classNames from 'classnames'
import { connect } from 'dva'
import CopyInput from '../CopyInput'
import styles from './index.less'

const InputGroup = Input.Group
import { gitServerIp } from '../../constants'

const HelpModal = ({ visible, projectDetail, dispatch }) => {

  const hideModelHandler = () => {
    dispatch({ type: 'projectDetail/setEntered', projectId: projectDetail.project._id })
  }

  const { name, repo_path } = projectDetail.project
  const repoPath = repo_path || `http://${gitServerIp}/repos/${localStorage.getItem('user_ID')}/${name}`

  return (
    <Modal
      title="Get Started"
      visible={visible}
      // onOk={hideModelHandler}
      onCancel={hideModelHandler}
      footer={[
        <Button key="ok" type='primary' loading={projectDetail.helpLoading} onClick={hideModelHandler}>Ok</Button>,
      ]}
    >
      <h1>Clone Your Project</h1>
      Clone your project directory with git to start working locally.
      <CopyInput text={`git clone ${repoPath}`}/>
    </Modal>
  )
}

export default connect(({ projectDetail }) => ({ projectDetail }))((HelpModal))
