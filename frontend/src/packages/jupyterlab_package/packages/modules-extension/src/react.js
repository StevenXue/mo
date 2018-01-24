import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Card, Button, Row } from 'antd'

import {
  NotebookActions,
} from '@jupyterlab/notebook'

import ParamsMapper from './ParamsMapper'

import { getModels } from './services'

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
      modules: res.response[1].children,
    })
  }

  componentDidMount() {
    getModels(this.onSuccess)
    NotebookActions.insertCode(this.props.panel.notebook,
      [
        `# Please use './volume' folder to store your data and models\n`,
        `import os\n`,
        `import module_client\n`,
        `import conf_parser\n`,
      ],
    )
  }

  clickModule(module) {
    // console.log('app', this.props.app)
    // console.log('notebook', this.props.panel)
    this.setState({
      moduleId: module._id,
      module: module,
      args: module.steps[3].args,
    })
  }

  backToList(module) {
    this.setState({
      moduleId: undefined,
      module: undefined,
      args: undefined,
    })
  }

  insertCode() {
    console.log('notebook', this.props.panel)
    NotebookActions.insertCode(this.props.panel.notebook,
      [
        `conf = '${genConf(this.state.args)}'\n`,
        `module_client('${this.state.module.entry_function}', conf_parser(conf))\n`,
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
                      baseArgs={this.state.module.steps[3].args}
        />
      </div>
    )
  }

  render() {

    if (this.state.moduleId !== undefined) {
      return (
        <div style={{ height: 100 }}>
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
                  onClick={() => this.clickModule(module)}
                  style={{ margin: '5px 3px', cursor: 'pointer' }}>
              {module.description}
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
