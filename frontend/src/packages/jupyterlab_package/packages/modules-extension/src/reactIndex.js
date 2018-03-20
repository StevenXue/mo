import * as React from 'react'
import { Card, Button, Row, Col, Input, Icon } from 'antd'
import * as pathToRegexp from 'path-to-regexp'
import ReactMde from 'react-mde'
// const {ReactMdeTypes, ReactMdeCommands} = ReactMde

import {
  VDomRenderer,
} from '@jupyterlab/apputils'

import {
  NotebookActions,
} from '@jupyterlab/notebook'

import {
  defaultOverview,
} from '@jupyterlab/services'

import ParamsMapper from './ParamsMapper'

import { addModuleToApp, getModule, getProjects } from './services'

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
      projects: [],
    }
    const hash = window.location.hash
    const match = pathToRegexp('#/workspace/:appId/:type').exec(hash)
    if (match) {
      this.appId = match[1]
    }
  }

  componentDidMount() {
    this.fetchData({})
  }

  fetchData({ payload }) {
    let filter = { type, privacy };
    ['query', 'privacy'].forEach((key) => {
      if (this.state[key]) {
        filter[key] = this.stats[key]
      }
    })
    if (payload) {
      for (let key in payload) {
        if (!payload.hasOwnProperty(key)) {
          continue
        }
        if (payload[key]) {
          filter[key] = payload[key]
          this.setState({
            key: payload[key],
          })
        }
      }
    }
    getProjects({
      filter,
      onJson: (projects) => this.setState({
        projects,
      }),
    })
  }

  onModuleSuccess = (response, func) => {
    this.setState({
      projectId: response._id,
      project: response,
      func: func,
      args: func ? Object.values(response.input[func]) : undefined,
    })
  }

  clickProject(project, func) {
    getModule({
      moduleId: project._id,
      onJson: (response) => this.onModuleSuccess(response, func),
    })
  }

  backToList(project) {
    this.setState({
      projectId: undefined,
      project: undefined,
      func: undefined,
      args: undefined,
    })
  }

  handleQueryChange(value) {
    this.fetchData({ payload: { query: value } })
  }

  insertCode() {
    const user_ID = localStorage.getItem('user_ID')
    NotebookActions.insertCode(this.props.tracker.currentWidget.notebook,
      [
        `conf = '${genConf(this.state.args)}'\n`,
        `conf = json_parser(conf)\n`,
        `result = ${this.state.func}('${user_ID}/${this.state.project.name}', conf)`,
      ],
    )
    addModuleToApp({ appId: this.appId, moduleId: this.state.projectId, func: this.state.func })
  }

  setValue(values) {
    let args = this.state.args
    for (let key in values) {
      let idx = args.findIndex(e => e.name === key)
      if (Array.isArray(values)) {
        args[idx].values = values[key]
      } else {
        args[idx].value = values[key]
      }
    }
    this.setState({
      args,
    })
  }

  renderParameters() {
    return (
      <div>
        <ParamsMapper args={this.state.args}
                      setValue={(values) => this.setValue(values)}
                      baseArgs={Object.values(this.state.project.input[this.state.func])}
        />
      </div>
    )
  }

  render() {
    if (this.state.projectId !== undefined) {
      if (this.state.func) {
        return (
          <div style={{ height: '100%', overflowY: 'auto' }}>
            <header style={{ cursor: 'pointer' }} onClick={() => this.backToList()}>
              <Icon type="left"/>{this.state.project.name}
            </header>
            {this.renderParameters()}
            <Row>
              <Button type='primary' onClick={() => this.insertCode()}>Insert Code</Button>
              {/*<Button onClick={() => this.backToList()}>Back to List</Button>*/}
            </Row>
          </div>
        )
      } else {
        const overview = this.state.project.overview || defaultOverview
        return (
          <div style={{ height: '100%', overflowY: 'auto' }}>
            <header style={{ cursor: 'pointer' }} onClick={() => this.backToList()}>
              <Icon type="left"/>{this.state.project.name}
            </header>
            <div>
              <ReactMde
                textAreaProps={{
                  id: 'ta1',
                  name: 'ta1',
                }}
                value={{ text: overview }}
                showdownOptions={{ tables: true, simplifiedAutoLink: true }}
                visibility={{
                  toolbar: false,
                  textarea: false,
                  previewHelp: false,
                }}
              />
            </div>
          </div>
        )
      }
    } else {
      return (
        <div style={{ height: '100%' }}>
          <header>MODULE LIST</header>
          <Search
            placeholder="input search text"
            onSearch={(value) => this.handleQueryChange(value)}
          />
          <div className='list'>
            {this.state.projects.map((project) =>
              <Card key={project.name} title={project.name}
                    extra={<Button onClick={() => this.clickProject(project)}>Detail</Button>}
                // onClick={() => this.clickModule(project)}
                    style={{ margin: '5px 3px', cursor: 'pointer' }}>
                <Col>
                  {project.description}
                  {project.category === 'model' ? <Row>
                    <Button onClick={() => this.clickProject(project, 'train')}>train</Button>
                    <Button onClick={() => this.clickProject(project, 'predict')}>predict</Button>
                  </Row> : <Row>
                    <Button onClick={() => this.clickProject(project, 'run')}>run</Button>
                  </Row>}
                </Col>
              </Card>)}
          </div>
        </div>
      )
    }
  }

}

