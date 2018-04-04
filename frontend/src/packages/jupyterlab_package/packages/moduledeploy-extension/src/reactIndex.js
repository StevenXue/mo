import * as React from 'react'
import { Card, Button, Row, Col, Input, Spin } from 'antd'
import * as pathToRegexp from 'path-to-regexp'

import {
  VDomRenderer,
} from '@jupyterlab/apputils'

import {
  NotebookActions,
} from '@jupyterlab/notebook'

import { fetchProject, testModule } from './service'

function genConf(args) {
  return JSON.stringify(args).replace(/'/g, '`')
}

const Search = Input.Search

const type = 'module'
const privacy = 'public'

export class ModulePage extends React.Component {

  constructor() {
    super()
    this.state = {
      testResult: [],
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
      fetchProject({
        projectId,
        onJson: (project) => {
          this.setState({
            project,
            testing: true,
          })

          testModule({
            projectId,
            onJson: (failures) => {
              console.log(failures)
              let testResult = []
              if (failures.length > 0) {
                testResult = failures
                document.getElementsByClassName('testing-state')[0].value = 'failed'
              } else {
                testResult = ['All test passed']
                document.getElementsByClassName('testing-state')[0].value = 'passed'
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

  render() {
    if (this.state.project !== undefined) {
      return (
        <div style={{ minHeight: 100, overflowY: 'auto' }}>
          <input style={{ display: 'none' }} className='testing-state'/>
          <h3>{this.state.project.name}</h3>
          <p>{this.state.project.description}</p>
          {this.state.testResult.length === 0 ? <Spin spinning={this.state.testing} tip="Running test cases..."/> :
            <div>
              <h3>Testing Result:</h3>
              {this.state.testResult.map(e => <div>{e}<br/><br/></div>)}
            </div>}
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

