import * as React from 'react'
import {Input, Button, message} from 'antd'
import {addDatasetToApp} from '../services'
// import styles from './index.less'
const InputGroup = Input.Group

const CopyInput = ({text, appId, datasetId, setApp}) => {

    const copyHandler = () => {
        /* Get the text field */
        let copyText = document.getElementById('git-command' + text)

        /* Select the text field */
        copyText.select()

        /* Copy the text inside the text field */
        document.execCommand('Copy')
        if(appId) {
            addDatasetToApp({
                appId,
                datasetId,
                onJson: (app) => {
                    /* Alert the copied text */
                    message.success('Import success and copied data path: ' + copyText.value)
                    setApp(app)
                }
            })
        }
    }

    return (
        <div>
            <InputGroup>
                <Input value={text} id={'git-command' + text}
                       className='copy-input' readOnly/>
                <div className="ant-input-group-wrap">
                    <Button icon="file-add" className='copy-btn' onClick={copyHandler}>
                        Import
                    </Button>
                </div>
            </InputGroup>
        </div>
    )
}

export default CopyInput
