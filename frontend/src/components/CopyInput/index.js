import React, { Component } from 'react'
import { Input, Button, message } from 'antd'
import styles from './index.less'
const InputGroup = Input.Group

const CopyInput = ({ text, fog}) => {

  const copyHandler = () => {
    /* Get the text field */
    let copyText = document.getElementById('git-command'+text)

    /* Select the text field */
    copyText.select()

    /* Copy the text inside the text field */
    document.execCommand('Copy')

    /* Alert the copied text */
    message.success('Copied the text: ' + copyText.value)
  }

  const check = ()=>{
    return fog?{width:fog}:{}
  }

  return (
    <div style={check()}>
      <InputGroup>
        <Input value={text} id={'git-command'+text}
               className={styles.input} readOnly/>
        <div className="ant-input-group-wrap">
          <Button icon="copy" className={styles.btn} onClick={copyHandler}>
            Copy
          </Button>
        </div>
      </InputGroup>
    </div>
  )
}

export default CopyInput
