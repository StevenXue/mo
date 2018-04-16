import * as React from 'react'
import {Checkbox, Tooltip, Radio, Input, Spin, Alert} from 'antd'
import * as pathToRegexp from 'path-to-regexp'

import {
    VDomRenderer,
} from '@jupyterlab/apputils'

import {
    NotebookActions,
} from '@jupyterlab/notebook'

import {getModule, testModule} from './service'

function genConf(args) {
    return JSON.stringify(args).replace(/'/g, '`')
}

const Search = Input.Search
const RadioGroup = Radio.Group;


const type = 'module'
const privacy = 'public'

export class ModulePage extends React.Component {

    constructor() {
        super()
        this.state = {
            testResult: [],
            publish: false,
            version: undefined
        }
    }

    componentDidMount() {
        console.log('mount')
        const hash = window.location.hash
        const match = pathToRegexp('#/workspace/:projectId/:type').exec(hash)
        if (match) {
            console.log('match')
            let projectId = match[1]
            // let type = match[2];
            getModule({
                moduleId: projectId,
                onJson: (project) => {
                    this.setState({
                        project,
                        testing: true,
                    })
                    if (project.privacy === 'public') {
                        this.setInitVersionNumber(project)
                    }
                    testModule({
                        projectId,
                        onJson: (failures) => {
                            console.log(failures)
                            let testResult = []
                            if (failures.length > 0) {
                                testResult = failures
                                document.getElementsByClassName('testingState')[0].value = 'failed'
                            } else {
                                testResult = ['All test passed']
                                document.getElementsByClassName('testingState')[0].value = 'passed'
                            }
                            this.setState({
                                testResult,
                                testing: false,
                            })
                        },
                    })
                },
            })
        }
    }

    onCheck(e) {
        if (e.target.checked === true) {
            this.setInitVersionNumber(this.state.project)
        } else {
            this.unsetInitVersionNumber()
        }
        this.setState({
            publish: e.target.checked
        });
    }

    setInitVersionNumber(project) {
        const [v1, v2, v3] = this.getInitVersionNumber(project);
        document.getElementsByClassName('versionNumber')[0].value = `${v1}.${v2}.${v3 + 1}`
    }

    unsetInitVersionNumber() {
        document.getElementsByClassName('versionNumber')[0].value = '';
    }

    getInitVersionNumber(project) {
        const {versions} = project;
        const versionNow = versions.slice(-1)[0] || '0.0.0';
        return versionNow.split('.').map(e => parseInt(e));
    }

    onVersionChange = (e) => {
        console.log('radio checked', e.target.value);
        this.setState({
            version: e.target.value,
        });
        document.getElementsByClassName('versionNumber')[0].value = e.target.value
    }

    render() {
        const radioStyle = {
            display: 'block',
            height: '30px',
            lineHeight: '30px',
        };
        let color, alertType;
        if (this.state.testResult[0] === 'All test passed') {
            color = 'green'
            alertType = 'success'
        } else {
            color = 'red'
            alertType = 'error'
        }
        if (this.state.project !== undefined) {
            const [v1, v2, v3] = this.getInitVersionNumber(this.state.project);
            return (
                <div style={{minHeight: 100, overflowY: 'auto'}}>
                    <h3>{this.state.project.name}</h3>
                    <p>{this.state.project.description}</p>
                    {
                        this.state.project.privacy === 'private' &&
                        <Tooltip placement="top"
                                 overlayStyle={{zIndex: 99999}}
                                 title='Publishing a module means the module will be accessed by others, otherwise, the module can only be accessed and tested by owner (you)'>
                            <Checkbox onChange={(e) => this.onCheck(e)} style={{margin: '10px 0'}}>Publish this
                                module?</Checkbox>
                            {this.state.publish && <Alert showIcon message="Once you publish a version of your project, you can never undo it!" type="info" />}
                        </Tooltip>
                    }
                    {
                        (this.state.project.privacy === 'public' || this.state.publish) &&
                        <div style={{margin: '0 0 10px 0'}}>
                            <h3>What version should this be published as?</h3>
                            <RadioGroup onChange={(e) => this.onVersionChange(e)}
                                        value={this.state.version || `${v1}.${v2}.${v3 + 1}`}>
                                <Radio key='r1' style={radioStyle}
                                       value={`${v1 + 1}.${v2}.${v3}`}>{v1 + 1}.{v2}.{v3} (Major: for API breaking
                                    changes)</Radio>
                                <Radio key='r2' style={radioStyle}
                                       value={`${v1}.${v2 + 1}.${v3}`}>{v1}.{v2 + 1}.{v3} (Minor: for
                                    backward-compatible features)</Radio>
                                <Radio key='r3' style={radioStyle}
                                       value={`${v1}.${v2}.${v3 + 1}`}>{v1}.{v2}.{v3 + 1} (Revision: for
                                    backward-compatible bug fixes)</Radio>
                            </RadioGroup>
                        </div>
                    }
                    {
                        this.state.testResult.length === 0 ?
                            <Spin spinning={true} tip="Running test cases..." style={{width: '100%'}}/> :
                            <div>
                                <h3>Testing Result:</h3>
                                <div className='test-result'>
                                    {this.state.testResult.map(e =>
                                        <Alert key={e} message={<div style={{whiteSpace: 'pre-line'}}>{e}</div>}
                                               type={alertType} showIcon
                                        style={{margin: 5}}/>
                                    )}
                                </div>
                            </div>
                    }
                </div>
            )
        } else {
            return (
                <div>
                    {'Loading...'}
                </div>
            )
        }
    }

}

