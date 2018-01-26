import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Card, Button, Row, Col } from 'antd'

import {
  NotebookActions,
} from '@jupyterlab/notebook'

import ParamsMapper from './ParamsMapper'

import { getModules, getModule } from './services'

function genConf(args) {
  return JSON.stringify(args).replace(/'/g, '`')
}

class IndexPage extends React.Component {

  constructor() {
    super()
    this.state = {
      modules: [],
      moduleId: undefined,
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
    NotebookActions.insertCode(this.props.panel.notebook,
      [
        `# Please use current (work) folder to store your data and models\n`,
        `import os\n`,
        `import sys\n`,
        `sys.path.append('../')\n`,
        `\n`,
        `from modules import json_parser\n`,
        `from modules import Client\n`,
        `\n`,
        `client = Client('fackAPI')\n`,
        `run = client.run\n`,
        `train = client.train\n`,
        `predict = client.predict`,
      ],
    )
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
    console.log('notebook', this.props.panel)
    NotebookActions.insertCode(this.props.panel.notebook,
      [
        `conf = '${genConf(this.state.args)}'\n`,
        `conf = json_parser(conf)\n`,
        `predict('${user_ID}/${this.state.module.name}', conf)\n`,
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
        <div style={{ height: 100 }}>
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
      )
    }
  }

}

// const IndexPageDva = connect()(IndexPage)

export default function renderReact(node, app, panel) {
  ReactDOM.render(<IndexPage app={app} panel={panel}/>, node)
}
