import React, { Component } from 'react'
import { Modal, Input, Button, message } from 'antd'
import classNames from 'classnames';
import { connect } from 'dva'
import styles from './index.less'
const InputGroup = Input.Group;

const HelpModal = ({visible, projectDetail, dispatch}) => {

  const hideModelHandler = () => {
    dispatch({type:'projectDetail/setEntered', projectId: projectDetail.project._id})
  }

  const okHandler = () => {
    dispatch({type:'projectDetail/setEntered', projectId: projectDetail.project._id})
  }

  const copyHandler = () => {
    /* Get the text field */
    let copyText = document.getElementById("git-command");

    /* Select the text field */
    copyText.select();

    /* Copy the text inside the text field */
    document.execCommand("Copy");

    /* Alert the copied text */
    message.success("Copied the text: " + copyText.value);
  }

  return (
    <Modal
      title="Get Started"
      visible={visible}
      onOk={okHandler}
      onCancel={hideModelHandler}
      footer={[
        <Button key="ok" type='primary' onClick={okHandler}>Ok</Button>
      ]}
    >
      <h1>Clone Your Module</h1>
      Clone your module template with git to start working locally.
      <InputGroup >
        <Input value='git clone https://github.com/Acrobaticat/mo-cookiecutter-python.git' id='git-command' className={styles.input}/>
        <div className="ant-input-group-wrap">
          <Button icon="copy" className={styles.btn} onClick={copyHandler}>
            Copy
          </Button>
        </div>
      </InputGroup>
    </Modal>
  )
}

export default connect(({ projectDetail }) => ({ projectDetail }))((HelpModal))
