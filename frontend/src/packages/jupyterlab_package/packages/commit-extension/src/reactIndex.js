import * as React from 'react'
import { Card, Button, Row, Col, Input } from 'antd'
import * as pathToRegexp from 'path-to-regexp';

import {
  VDomRenderer,
} from '@jupyterlab/apputils'

import {
  NotebookActions,
} from '@jupyterlab/notebook'

import { fetchProject } from './service'

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
    }
  }

  componentDidMount() {
    console.log('mount')
    // const hash = window.location.hash
    // const match = pathToRegexp('#/workspace/:projectId/:type').exec(hash)
    // if (match) {
    //   console.log('match')
    //   let projectId = match[1]
    //   // let type = match[2];
    //   fetchProject({
    //     projectId,
    //     onJson: (project) => {
    //       this.setState({
    //         project,
    //       })
    //     },
    //   })
    // }
  }

  render() {
    return (
      <Input placeholder='Commit Message'/>
    )
    // if (this.state.project !== undefined) {
    //   return (
    //     <div style={{ minHeight: 100, overflowY: 'auto' }}>
    //       <h3>{this.state.project.name}</h3>
    //       <p>{this.state.project.description}</p>
    //     </div>
    //   )
    // } else {
    //   return (
    //     <div>
    //       {'Loading...'}
    //     </div>
    //   )
    // }
  }

}

