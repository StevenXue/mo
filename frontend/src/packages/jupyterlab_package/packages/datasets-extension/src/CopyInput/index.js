import * as React from 'react'
import { Input, Button, message } from 'antd'
// import styles from './index.less'
const InputGroup = Input.Group

const CopyInput = ({ text }) => {

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

  return (
    <div>
      <InputGroup>
        <Input value={text} id={'git-command'+text}
               className='copy-input' readOnly/>
        <div className="ant-input-group-wrap">
          <Button icon="copy" className='copy-btn' onClick={copyHandler}>
            Copy
          </Button>
        </div>
      </InputGroup>
    </div>
  )
}

export default CopyInput
