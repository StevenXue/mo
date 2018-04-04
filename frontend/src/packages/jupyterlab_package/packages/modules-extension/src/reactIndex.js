import * as React from 'react'
import { Card, Button, Row, Col, Input, Icon, Pagination } from 'antd'
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

      query: undefined,
      privacy: undefined,
      totalNumber: 0,
      pageNo: 1,
      pageSize: 5,
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
  fetchData({ payload = {} }) {

    // default filter
    let filter = { type, privacy };

    // get state filter
    ['query', 'privacy', 'page_no', 'page_size'].forEach((key) => {
      filter[key] = this.state[key.hyphenToHump()]
    })

    // update filter from args
    for (let key in payload) {
      filter[key] = payload[key]
      this.setState({
        [key.hyphenToHump()]: payload[key],
      })
    }

    // fetch
    getProjects({
      filter,
      onJson: ({ projects, count }) => this.setState({
        projects,
        totalNumber: count,
      }),
    })
  }

  onModuleSuccess = (response, func) => {
    this.setState({
      projectId: response._id,
      project: response,
      func: func,
      args: func ? Object.values(response.args.input[func]) : undefined,
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
    let dict = {}
    this.state.args.forEach(arg => {
      dict[arg.name] = arg.value || arg.default_value
    })
    NotebookActions.insertCode(this.props.tracker.currentWidget.notebook,
      [
        `conf = '${JSON.stringify(dict)}'\n`,
        `conf = json_parser(conf)\n`,
        `print(conf)`
      ],
    )
    NotebookActions.insertCode(this.props.tracker.currentWidget.notebook,
      [
        `result = ${this.state.func}('${this.state.project.user_ID}/${this.state.project.name}', conf)`,
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
                      baseArgs={Object.values(this.state.project.args.input[this.state.func])}
        />
      </div>
    )
  }

  onShowSizeChange = (pageNo, pageSize) => {
    this.fetchData({ payload: { page_no: pageNo, page_size: pageSize } })
  }

  render() {
    if (this.state.projectId !== undefined) {
      if (this.state.func) {
        return (
          <div className='container'>
            <header style={{ cursor: 'pointer' }} onClick={() => this.backToList()}>
              <Icon type="left"/>{this.state.project.name}
            </header>
            <div style={{ height: 'auto', overflowY: 'auto' }}>
              {this.renderParameters()}
            </div>
            <Row>
              <Button type='primary' onClick={() => this.insertCode()}>Insert Code</Button>
              {/*<Button onClick={() => this.backToList()}>Back to List</Button>*/}
            </Row>
          </div>
        )
      } else {
        const overview = this.state.project.overview || defaultOverview
        return (
          <div className='container'>
            <header style={{ cursor: 'pointer' }} onClick={() => this.backToList()}>
              <Icon type="left"/>{this.state.project.name}
            </header>
            <div style={{ height: 'auto', overflowY: 'auto' }}>
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
        <div className='container'>
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
            <div className='pagination'>
              <Pagination showSizeChanger
                          onShowSizeChange={this.onShowSizeChange}
                          onChange={this.onShowSizeChange}
                          defaultCurrent={1}
                          defaultPageSize={5}
                          pageSizeOptions={['5', '10', '15', '20', '25']}
                          total={this.state.totalNumber}/>
            </div>
          </div>
        </div>
      )
    }
  }

}

