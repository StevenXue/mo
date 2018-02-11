import * as React from 'react'
import { Card, Button, Row, Col } from 'antd'

import {
  VDomRenderer
} from '@jupyterlab/apputils';

import {
  NotebookActions,
} from '@jupyterlab/notebook'

import ParamsMapper from './ParamsMapper'

import { getModules, getModule } from './services'

function genConf(args) {
  return JSON.stringify(args).replace(/'/g, '`')
}

export
class ModulePage extends React.Component {

  constructor() {
    super()
    this.state = {
      modules: [],
    }
  }

  onSuccess = (res) => {
    this.setState({
      modules: res.response,
    })
  }

  onModuleSuccess = (res, func) => {
    this.setState({
      moduleId: res.response._id,
      module: res.response,
      func: func,
      args: Object.values(res.response.args[func]),
    })
  }

  componentDidMount() {
    getModules(this.onSuccess)
  }

  clickModule(module, func) {
    getModule({ moduleId: module._id }, (res) => this.onModuleSuccess(res, func))
  }

  backToList(module) {
    this.setState({
      moduleId: undefined,
      module: undefined,
      func: undefined,
      args: undefined,
    })
  }

  insertCode() {
    const user_ID = localStorage.getItem('user_ID')
    NotebookActions.insertCode(this.props.tracker.currentWidget.notebook,
      [
        `conf = '${genConf(this.state.args)}'\n`,
        `conf = json_parser(conf)\n`,
        `result = ${this.state.func}('${user_ID}/${this.state.module.name}', conf)\n`,
      ],
    )
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
                      baseArgs={Object.values(this.state.module.args[this.state.func])}
        />
      </div>
    )
  }

  render() {
    if (this.state.moduleId !== undefined) {
      return (
        <div style={{ minHeight: 100, overflowY: 'auto' }}>
          <h2>{this.state.module.name}</h2>
          {this.renderParameters()}
          <Row>
            <Button type='primary' onClick={() => this.insertCode()}>Insert Code</Button>
            <Button onClick={() => this.backToList()}>Cancel</Button>
          </Row>
        </div>
      )
    } else {
      return (
        <div style={{ height: '100%' }}>
          <header>MODULE LIST</header>
          <div className='list'>
          {this.state.modules.map((module) =>
            <Card key={module.name} title={module.name}
              // onClick={() => this.clickModule(module)}
                  style={{ margin: '5px 3px', cursor: 'pointer' }}>
              <Col>
                {module.description}
                <Row>
                  <Button onClick={() => this.clickModule(module, 'train')}>train</Button>
                  <Button onClick={() => this.clickModule(module, 'predict')}>predict</Button>
                </Row>
              </Col>
            </Card>)}
          </div>
        </div>
      )
    }
  }

}

