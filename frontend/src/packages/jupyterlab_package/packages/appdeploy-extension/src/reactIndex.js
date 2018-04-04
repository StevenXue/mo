import * as React from 'react'
import { Button, Row, Col, Input } from 'antd'
import * as pathToRegexp from 'path-to-regexp'

import {
  VDomRenderer,
} from '@jupyterlab/apputils'

import {
  NotebookActions,
} from '@jupyterlab/notebook'

import { fetchProject, getContents } from './service'

function genConf(args) {
  return JSON.stringify(args).replace(/'/g, '`')
}

const Search = Input.Search

const type = 'module'
const privacy = 'public'

export class ModulePage extends React.Component {

  constructor() {
    super()
    this.state = {}
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
          const hubUserName = encodeURIComponent(`${localStorage.getItem('user_ID')}+${project.name}`)
          const hubToken = project.hub_token
          getContents({
            hubUserName, hubToken, onJson: (contents) => {
              this.setState({
                content: contents.content,
                project,
              })
            },
          })
        },
      })
    }
  }

  // selectChange(e) {
  //   console.log('select', e)
  //   document.getElementsByClassName('testing-state')[0].value = 'failed'
  // }

  render() {
    if (this.state.project !== undefined) {
      return (
        <div style={{ minHeight: 100, overflowY: 'auto' }}>
          <h3>{this.state.project.name}</h3>
          <p>{this.state.project.description}</p>
          <h4>Please select the main file:</h4>
          <select style={{ width: '80%' }}>
            {this.state.content.filter(file => file.path.includes('.py')).map((file) =>
              <option key={file.path} value={file.path}>{file.path}</option>)}
          </select>
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

